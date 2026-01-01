\# Backend API Implementation Guide



This document provides complete backend implementation examples for integrating the Email Template Manager with your existing project.



---



\## 🗂️ Database Schema (Complete SQL)



\### MySQL/MariaDB



```sql

-- Base Templates Table

CREATE TABLE base\_templates (

&nbsp;   id VARCHAR(50) PRIMARY KEY,

&nbsp;   name VARCHAR(255) NOT NULL,

&nbsp;   subject VARCHAR(500) NOT NULL,

&nbsp;   content TEXT NOT NULL,

&nbsp;   event\_type ENUM('enrollment', 'wellness', 'survey', 'benefits', 'claims', 'renewal', 'general') NOT NULL,

&nbsp;   description TEXT,

&nbsp;   created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,

&nbsp;   updated\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,

&nbsp;   

&nbsp;   INDEX idx\_event\_type (event\_type),

&nbsp;   INDEX idx\_created\_at (created\_at),

&nbsp;   FULLTEXT INDEX idx\_search (name, subject, description)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4\_unicode\_ci;



-- Corporate Templates Table

CREATE TABLE corporate\_templates (

&nbsp;   id VARCHAR(50) PRIMARY KEY,

&nbsp;   base\_template\_id VARCHAR(50) NOT NULL,

&nbsp;   corporate\_id VARCHAR(50) NOT NULL,

&nbsp;   name VARCHAR(255) NOT NULL,

&nbsp;   subject VARCHAR(500) NOT NULL,

&nbsp;   content TEXT NOT NULL,

&nbsp;   created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,

&nbsp;   updated\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,

&nbsp;   

&nbsp;   FOREIGN KEY (base\_template\_id) 

&nbsp;       REFERENCES base\_templates(id) 

&nbsp;       ON DELETE CASCADE 

&nbsp;       ON UPDATE CASCADE,

&nbsp;   FOREIGN KEY (corporate\_id) 

&nbsp;       REFERENCES tenants(tenant\_id) 

&nbsp;       ON DELETE CASCADE 

&nbsp;       ON UPDATE CASCADE,

&nbsp;   

&nbsp;   INDEX idx\_corporate\_id (corporate\_id),

&nbsp;   INDEX idx\_base\_template\_id (base\_template\_id),

&nbsp;   INDEX idx\_created\_at (created\_at),

&nbsp;   UNIQUE KEY unique\_corporate\_base (corporate\_id, base\_template\_id),

&nbsp;   FULLTEXT INDEX idx\_search (name, subject)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4\_unicode\_ci;



-- Email Logs Table (Optional but recommended)

CREATE TABLE email\_logs (

&nbsp;   id BIGINT AUTO\_INCREMENT PRIMARY KEY,

&nbsp;   template\_id VARCHAR(50),

&nbsp;   template\_type ENUM('base', 'corporate') NOT NULL,

&nbsp;   corporate\_id VARCHAR(50),

&nbsp;   recipient\_email VARCHAR(255) NOT NULL,

&nbsp;   subject VARCHAR(500) NOT NULL,

&nbsp;   status ENUM('pending', 'sent', 'failed', 'bounced') DEFAULT 'pending',

&nbsp;   error\_message TEXT,

&nbsp;   sent\_at TIMESTAMP NULL,

&nbsp;   created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,

&nbsp;   

&nbsp;   INDEX idx\_corporate\_id (corporate\_id),

&nbsp;   INDEX idx\_status (status),

&nbsp;   INDEX idx\_created\_at (created\_at),

&nbsp;   INDEX idx\_recipient (recipient\_email)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4\_unicode\_ci;

```



\### PostgreSQL



```sql

-- Event Type Enum

CREATE TYPE event\_type AS ENUM (

&nbsp;   'enrollment', 

&nbsp;   'wellness', 

&nbsp;   'survey', 

&nbsp;   'benefits', 

&nbsp;   'claims', 

&nbsp;   'renewal', 

&nbsp;   'general'

);



-- Base Templates Table

CREATE TABLE base\_templates (

&nbsp;   id VARCHAR(50) PRIMARY KEY,

&nbsp;   name VARCHAR(255) NOT NULL,

&nbsp;   subject VARCHAR(500) NOT NULL,

&nbsp;   content TEXT NOT NULL,

&nbsp;   event\_type event\_type NOT NULL,

&nbsp;   description TEXT,

&nbsp;   created\_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP,

&nbsp;   updated\_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP

);



CREATE INDEX idx\_base\_templates\_event\_type ON base\_templates(event\_type);

CREATE INDEX idx\_base\_templates\_created\_at ON base\_templates(created\_at);

CREATE INDEX idx\_base\_templates\_search ON base\_templates USING gin(to\_tsvector('english', name || ' ' || subject || ' ' || COALESCE(description, '')));



-- Corporate Templates Table

CREATE TABLE corporate\_templates (

&nbsp;   id VARCHAR(50) PRIMARY KEY,

&nbsp;   base\_template\_id VARCHAR(50) NOT NULL,

&nbsp;   corporate\_id VARCHAR(50) NOT NULL,

&nbsp;   name VARCHAR(255) NOT NULL,

&nbsp;   subject VARCHAR(500) NOT NULL,

&nbsp;   content TEXT NOT NULL,

&nbsp;   created\_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP,

&nbsp;   updated\_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP,

&nbsp;   

&nbsp;   FOREIGN KEY (base\_template\_id) 

&nbsp;       REFERENCES base\_templates(id) 

&nbsp;       ON DELETE CASCADE 

&nbsp;       ON UPDATE CASCADE,

&nbsp;   FOREIGN KEY (corporate\_id) 

&nbsp;       REFERENCES tenants(tenant\_id) 

&nbsp;       ON DELETE CASCADE 

&nbsp;       ON UPDATE CASCADE,

&nbsp;   

&nbsp;   UNIQUE (corporate\_id, base\_template\_id)

);



CREATE INDEX idx\_corporate\_templates\_corporate\_id ON corporate\_templates(corporate\_id);

CREATE INDEX idx\_corporate\_templates\_base\_template\_id ON corporate\_templates(base\_template\_id);

CREATE INDEX idx\_corporate\_templates\_created\_at ON corporate\_templates(created\_at);

CREATE INDEX idx\_corporate\_templates\_search ON corporate\_templates USING gin(to\_tsvector('english', name || ' ' || subject));



-- Update trigger for updated\_at

CREATE OR REPLACE FUNCTION update\_updated\_at\_column()

RETURNS TRIGGER AS $$

BEGIN

&nbsp;   NEW.updated\_at = CURRENT\_TIMESTAMP;

&nbsp;   RETURN NEW;

END;

$$ language 'plpgsql';



CREATE TRIGGER update\_base\_templates\_updated\_at BEFORE UPDATE

&nbsp;   ON base\_templates FOR EACH ROW

&nbsp;   EXECUTE FUNCTION update\_updated\_at\_column();



CREATE TRIGGER update\_corporate\_templates\_updated\_at BEFORE UPDATE

&nbsp;   ON corporate\_templates FOR EACH ROW

&nbsp;   EXECUTE FUNCTION update\_updated\_at\_column();

```



---



\## 🔧 Backend Implementation



\### Node.js + Express + MySQL



\*\*File: `routes/baseTemplates.js`\*\*



```javascript

const express = require('express');

const router = express.Router();

const { body, query, validationResult } = require('express-validator');

const db = require('../config/database');



// GET /api/base-templates

router.get('/',

&nbsp; \[

&nbsp;   query('eventType').optional().isIn(\['enrollment', 'wellness', 'survey', 'benefits', 'claims', 'renewal', 'general']),

&nbsp;   query('search').optional().isString()

&nbsp; ],

&nbsp; async (req, res) => {

&nbsp;   try {

&nbsp;     const errors = validationResult(req);

&nbsp;     if (!errors.isEmpty()) {

&nbsp;       return res.status(400).json({ errors: errors.array() });

&nbsp;     }



&nbsp;     const { eventType, search } = req.query;

&nbsp;     

&nbsp;     let query = 'SELECT \* FROM base\_templates WHERE 1=1';

&nbsp;     const params = \[];

&nbsp;     

&nbsp;     if (eventType) {

&nbsp;       query += ' AND event\_type = ?';

&nbsp;       params.push(eventType);

&nbsp;     }

&nbsp;     

&nbsp;     if (search) {

&nbsp;       query += ' AND (name LIKE ? OR subject LIKE ? OR description LIKE ?)';

&nbsp;       const searchTerm = `%${search}%`;

&nbsp;       params.push(searchTerm, searchTerm, searchTerm);

&nbsp;     }

&nbsp;     

&nbsp;     query += ' ORDER BY created\_at DESC';

&nbsp;     

&nbsp;     const \[results] = await db.query(query, params);

&nbsp;     res.json(results);

&nbsp;   } catch (error) {

&nbsp;     console.error('Error fetching base templates:', error);

&nbsp;     res.status(500).json({ error: 'Failed to fetch templates' });

&nbsp;   }

&nbsp; }

);



// GET /api/base-templates/:id

router.get('/:id', async (req, res) => {

&nbsp; try {

&nbsp;   const { id } = req.params;

&nbsp;   const \[results] = await db.query('SELECT \* FROM base\_templates WHERE id = ?', \[id]);

&nbsp;   

&nbsp;   if (results.length === 0) {

&nbsp;     return res.status(404).json({ error: 'Template not found' });

&nbsp;   }

&nbsp;   

&nbsp;   res.json(results\[0]);

&nbsp; } catch (error) {

&nbsp;   console.error('Error fetching template:', error);

&nbsp;   res.status(500).json({ error: 'Failed to fetch template' });

&nbsp; }

});



// POST /api/base-templates

router.post('/',

&nbsp; \[

&nbsp;   body('name').notEmpty().trim().isLength({ max: 255 }),

&nbsp;   body('subject').notEmpty().trim().isLength({ max: 500 }),

&nbsp;   body('content').notEmpty().trim(),

&nbsp;   body('eventType').isIn(\['enrollment', 'wellness', 'survey', 'benefits', 'claims', 'renewal', 'general']),

&nbsp;   body('description').optional().trim()

&nbsp; ],

&nbsp; async (req, res) => {

&nbsp;   try {

&nbsp;     const errors = validationResult(req);

&nbsp;     if (!errors.isEmpty()) {

&nbsp;       return res.status(400).json({ errors: errors.array() });

&nbsp;     }



&nbsp;     const { name, subject, content, eventType, description } = req.body;

&nbsp;     const id = `base\_${Date.now()}\_${Math.random().toString(36).substr(2, 9)}`;

&nbsp;     

&nbsp;     await db.query(

&nbsp;       'INSERT INTO base\_templates (id, name, subject, content, event\_type, description) VALUES (?, ?, ?, ?, ?, ?)',

&nbsp;       \[id, name, subject, content, eventType, description || '']

&nbsp;     );

&nbsp;     

&nbsp;     const \[results] = await db.query('SELECT \* FROM base\_templates WHERE id = ?', \[id]);

&nbsp;     res.status(201).json(results\[0]);

&nbsp;   } catch (error) {

&nbsp;     console.error('Error creating template:', error);

&nbsp;     res.status(500).json({ error: 'Failed to create template' });

&nbsp;   }

&nbsp; }

);



// PUT /api/base-templates/:id

router.put('/:id',

&nbsp; \[

&nbsp;   body('name').notEmpty().trim().isLength({ max: 255 }),

&nbsp;   body('subject').notEmpty().trim().isLength({ max: 500 }),

&nbsp;   body('content').notEmpty().trim(),

&nbsp;   body('eventType').isIn(\['enrollment', 'wellness', 'survey', 'benefits', 'claims', 'renewal', 'general']),

&nbsp;   body('description').optional().trim()

&nbsp; ],

&nbsp; async (req, res) => {

&nbsp;   try {

&nbsp;     const errors = validationResult(req);

&nbsp;     if (!errors.isEmpty()) {

&nbsp;       return res.status(400).json({ errors: errors.array() });

&nbsp;     }



&nbsp;     const { id } = req.params;

&nbsp;     const { name, subject, content, eventType, description } = req.body;

&nbsp;     

&nbsp;     const \[result] = await db.query(

&nbsp;       'UPDATE base\_templates SET name = ?, subject = ?, content = ?, event\_type = ?, description = ? WHERE id = ?',

&nbsp;       \[name, subject, content, eventType, description || '', id]

&nbsp;     );

&nbsp;     

&nbsp;     if (result.affectedRows === 0) {

&nbsp;       return res.status(404).json({ error: 'Template not found' });

&nbsp;     }

&nbsp;     

&nbsp;     const \[updated] = await db.query('SELECT \* FROM base\_templates WHERE id = ?', \[id]);

&nbsp;     res.json(updated\[0]);

&nbsp;   } catch (error) {

&nbsp;     console.error('Error updating template:', error);

&nbsp;     res.status(500).json({ error: 'Failed to update template' });

&nbsp;   }

&nbsp; }

);



// DELETE /api/base-templates/:id

router.delete('/:id', async (req, res) => {

&nbsp; try {

&nbsp;   const { id } = req.params;

&nbsp;   const \[result] = await db.query('DELETE FROM base\_templates WHERE id = ?', \[id]);

&nbsp;   

&nbsp;   if (result.affectedRows === 0) {

&nbsp;     return res.status(404).json({ error: 'Template not found' });

&nbsp;   }

&nbsp;   

&nbsp;   res.json({ success: true, message: 'Template deleted successfully' });

&nbsp; } catch (error) {

&nbsp;   console.error('Error deleting template:', error);

&nbsp;   res.status(500).json({ error: 'Failed to delete template' });

&nbsp; }

});



module.exports = router;

```



\*\*File: `routes/corporateTemplates.js`\*\*



```javascript

const express = require('express');

const router = express.Router();

const { body, query, validationResult } = require('express-validator');

const db = require('../config/database');



// GET /api/corporate-templates

router.get('/',

&nbsp; \[

&nbsp;   query('corporateId').optional().isString(),

&nbsp;   query('search').optional().isString()

&nbsp; ],

&nbsp; async (req, res) => {

&nbsp;   try {

&nbsp;     const errors = validationResult(req);

&nbsp;     if (!errors.isEmpty()) {

&nbsp;       return res.status(400).json({ errors: errors.array() });

&nbsp;     }



&nbsp;     const { corporateId, search } = req.query;

&nbsp;     

&nbsp;     let query = 'SELECT \* FROM corporate\_templates WHERE 1=1';

&nbsp;     const params = \[];

&nbsp;     

&nbsp;     if (corporateId) {

&nbsp;       query += ' AND corporate\_id = ?';

&nbsp;       params.push(corporateId);

&nbsp;     }

&nbsp;     

&nbsp;     if (search) {

&nbsp;       query += ' AND (name LIKE ? OR subject LIKE ?)';

&nbsp;       const searchTerm = `%${search}%`;

&nbsp;       params.push(searchTerm, searchTerm);

&nbsp;     }

&nbsp;     

&nbsp;     query += ' ORDER BY created\_at DESC';

&nbsp;     

&nbsp;     const \[results] = await db.query(query, params);

&nbsp;     res.json(results);

&nbsp;   } catch (error) {

&nbsp;     console.error('Error fetching corporate templates:', error);

&nbsp;     res.status(500).json({ error: 'Failed to fetch templates' });

&nbsp;   }

&nbsp; }

);



// GET /api/corporate-templates/:id

router.get('/:id', async (req, res) => {

&nbsp; try {

&nbsp;   const { id } = req.params;

&nbsp;   const \[results] = await db.query('SELECT \* FROM corporate\_templates WHERE id = ?', \[id]);

&nbsp;   

&nbsp;   if (results.length === 0) {

&nbsp;     return res.status(404).json({ error: 'Template not found' });

&nbsp;   }

&nbsp;   

&nbsp;   res.json(results\[0]);

&nbsp; } catch (error) {

&nbsp;   console.error('Error fetching template:', error);

&nbsp;   res.status(500).json({ error: 'Failed to fetch template' });

&nbsp; }

});



// POST /api/corporate-templates

router.post('/',

&nbsp; \[

&nbsp;   body('baseTemplateId').notEmpty().isString(),

&nbsp;   body('corporateId').notEmpty().isString(),

&nbsp;   body('name').notEmpty().trim().isLength({ max: 255 }),

&nbsp;   body('subject').notEmpty().trim().isLength({ max: 500 }),

&nbsp;   body('content').notEmpty().trim()

&nbsp; ],

&nbsp; async (req, res) => {

&nbsp;   try {

&nbsp;     const errors = validationResult(req);

&nbsp;     if (!errors.isEmpty()) {

&nbsp;       return res.status(400).json({ errors: errors.array() });

&nbsp;     }



&nbsp;     const { baseTemplateId, corporateId, name, subject, content } = req.body;

&nbsp;     

&nbsp;     // Verify base template exists

&nbsp;     const \[baseTemplate] = await db.query('SELECT id FROM base\_templates WHERE id = ?', \[baseTemplateId]);

&nbsp;     if (baseTemplate.length === 0) {

&nbsp;       return res.status(404).json({ error: 'Base template not found' });

&nbsp;     }

&nbsp;     

&nbsp;     // Verify corporate exists

&nbsp;     const \[corporate] = await db.query('SELECT tenant\_id FROM tenants WHERE tenant\_id = ?', \[corporateId]);

&nbsp;     if (corporate.length === 0) {

&nbsp;       return res.status(404).json({ error: 'Corporate not found' });

&nbsp;     }

&nbsp;     

&nbsp;     const id = `corp\_${Date.now()}\_${Math.random().toString(36).substr(2, 9)}`;

&nbsp;     

&nbsp;     await db.query(

&nbsp;       'INSERT INTO corporate\_templates (id, base\_template\_id, corporate\_id, name, subject, content) VALUES (?, ?, ?, ?, ?, ?)',

&nbsp;       \[id, baseTemplateId, corporateId, name, subject, content]

&nbsp;     );

&nbsp;     

&nbsp;     const \[results] = await db.query('SELECT \* FROM corporate\_templates WHERE id = ?', \[id]);

&nbsp;     res.status(201).json(results\[0]);

&nbsp;   } catch (error) {

&nbsp;     if (error.code === 'ER\_DUP\_ENTRY') {

&nbsp;       return res.status(409).json({ error: 'Template customization already exists for this corporate' });

&nbsp;     }

&nbsp;     console.error('Error creating corporate template:', error);

&nbsp;     res.status(500).json({ error: 'Failed to create template' });

&nbsp;   }

&nbsp; }

);



// PUT /api/corporate-templates/:id

router.put('/:id',

&nbsp; \[

&nbsp;   body('name').notEmpty().trim().isLength({ max: 255 }),

&nbsp;   body('subject').notEmpty().trim().isLength({ max: 500 }),

&nbsp;   body('content').notEmpty().trim()

&nbsp; ],

&nbsp; async (req, res) => {

&nbsp;   try {

&nbsp;     const errors = validationResult(req);

&nbsp;     if (!errors.isEmpty()) {

&nbsp;       return res.status(400).json({ errors: errors.array() });

&nbsp;     }



&nbsp;     const { id } = req.params;

&nbsp;     const { name, subject, content } = req.body;

&nbsp;     

&nbsp;     const \[result] = await db.query(

&nbsp;       'UPDATE corporate\_templates SET name = ?, subject = ?, content = ? WHERE id = ?',

&nbsp;       \[name, subject, content, id]

&nbsp;     );

&nbsp;     

&nbsp;     if (result.affectedRows === 0) {

&nbsp;       return res.status(404).json({ error: 'Template not found' });

&nbsp;     }

&nbsp;     

&nbsp;     const \[updated] = await db.query('SELECT \* FROM corporate\_templates WHERE id = ?', \[id]);

&nbsp;     res.json(updated\[0]);

&nbsp;   } catch (error) {

&nbsp;     console.error('Error updating corporate template:', error);

&nbsp;     res.status(500).json({ error: 'Failed to update template' });

&nbsp;   }

&nbsp; }

);



// DELETE /api/corporate-templates/:id

router.delete('/:id', async (req, res) => {

&nbsp; try {

&nbsp;   const { id } = req.params;

&nbsp;   const \[result] = await db.query('DELETE FROM corporate\_templates WHERE id = ?', \[id]);

&nbsp;   

&nbsp;   if (result.affectedRows === 0) {

&nbsp;     return res.status(404).json({ error: 'Template not found' });

&nbsp;   }

&nbsp;   

&nbsp;   res.json({ success: true, message: 'Template deleted successfully' });

&nbsp; } catch (error) {

&nbsp;   console.error('Error deleting corporate template:', error);

&nbsp;   res.status(500).json({ error: 'Failed to delete template' });

&nbsp; }

});



module.exports = router;

```



\*\*File: `routes/tenants.js`\*\*



```javascript

const express = require('express');

const router = express.Router();

const db = require('../config/database');



// GET /api/tenants

router.get('/', async (req, res) => {

&nbsp; try {

&nbsp;   const \[results] = await db.query(

&nbsp;     'SELECT tenant\_id as id, corporate\_legal\_name as name FROM tenants ORDER BY corporate\_legal\_name'

&nbsp;   );

&nbsp;   res.json(results);

&nbsp; } catch (error) {

&nbsp;   console.error('Error fetching tenants:', error);

&nbsp;   res.status(500).json({ error: 'Failed to fetch tenants' });

&nbsp; }

});



// GET /api/tenants/:id

router.get('/:id', async (req, res) => {

&nbsp; try {

&nbsp;   const { id } = req.params;

&nbsp;   const \[results] = await db.query(

&nbsp;     'SELECT tenant\_id as id, corporate\_legal\_name as name FROM tenants WHERE tenant\_id = ?',

&nbsp;     \[id]

&nbsp;   );

&nbsp;   

&nbsp;   if (results.length === 0) {

&nbsp;     return res.status(404).json({ error: 'Tenant not found' });

&nbsp;   }

&nbsp;   

&nbsp;   res.json(results\[0]);

&nbsp; } catch (error) {

&nbsp;   console.error('Error fetching tenant:', error);

&nbsp;   res.status(500).json({ error: 'Failed to fetch tenant' });

&nbsp; }

});



module.exports = router;

```



\*\*File: `routes/emails.js`\*\*



```javascript

const express = require('express');

const router = express.Router();

const multer = require('multer');

const nodemailer = require('nodemailer');

const { body, validationResult } = require('express-validator');

const db = require('../config/database');



// Configure multer for file uploads

const upload = multer({

&nbsp; storage: multer.memoryStorage(),

&nbsp; limits: {

&nbsp;   fileSize: 10 \* 1024 \* 1024, // 10MB limit

&nbsp;   files: 5 // Max 5 files

&nbsp; },

&nbsp; fileFilter: (req, file, cb) => {

&nbsp;   // Allow common file types

&nbsp;   const allowedMimes = \[

&nbsp;     'application/pdf',

&nbsp;     'application/msword',

&nbsp;     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

&nbsp;     'application/vnd.ms-excel',

&nbsp;     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

&nbsp;     'image/jpeg',

&nbsp;     'image/png',

&nbsp;     'image/gif'

&nbsp;   ];

&nbsp;   

&nbsp;   if (allowedMimes.includes(file.mimetype)) {

&nbsp;     cb(null, true);

&nbsp;   } else {

&nbsp;     cb(new Error('Invalid file type'));

&nbsp;   }

&nbsp; }

});



// Configure email transporter

const transporter = nodemailer.createTransport({

&nbsp; host: process.env.SMTP\_HOST,

&nbsp; port: process.env.SMTP\_PORT,

&nbsp; secure: process.env.SMTP\_SECURE === 'true',

&nbsp; auth: {

&nbsp;   user: process.env.SMTP\_USER,

&nbsp;   pass: process.env.SMTP\_PASS

&nbsp; }

});



// POST /api/emails/test

router.post('/test',

&nbsp; upload.array('attachments', 5),

&nbsp; \[

&nbsp;   body('recipientEmail').isEmail(),

&nbsp;   body('subject').notEmpty().trim(),

&nbsp;   body('content').notEmpty().trim(),

&nbsp;   body('templateId').optional().isString(),

&nbsp;   body('corporateId').optional().isString()

&nbsp; ],

&nbsp; async (req, res) => {

&nbsp;   try {

&nbsp;     const errors = validationResult(req);

&nbsp;     if (!errors.isEmpty()) {

&nbsp;       return res.status(400).json({ errors: errors.array() });

&nbsp;     }



&nbsp;     const { recipientEmail, subject, content, templateId, corporateId } = req.body;

&nbsp;     const files = req.files;

&nbsp;     

&nbsp;     // Prepare attachments

&nbsp;     const attachments = files?.map(file => ({

&nbsp;       filename: file.originalname,

&nbsp;       content: file.buffer,

&nbsp;       contentType: file.mimetype

&nbsp;     })) || \[];

&nbsp;     

&nbsp;     // Send email

&nbsp;     const info = await transporter.sendMail({

&nbsp;       from: process.env.FROM\_EMAIL,

&nbsp;       to: recipientEmail,

&nbsp;       subject: subject,

&nbsp;       html: content,

&nbsp;       attachments: attachments

&nbsp;     });

&nbsp;     

&nbsp;     // Log the email (optional)

&nbsp;     if (templateId) {

&nbsp;       await db.query(

&nbsp;         'INSERT INTO email\_logs (template\_id, template\_type, corporate\_id, recipient\_email, subject, status, sent\_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',

&nbsp;         \[

&nbsp;           templateId,

&nbsp;           templateId.startsWith('corp\_') ? 'corporate' : 'base',

&nbsp;           corporateId || null,

&nbsp;           recipientEmail,

&nbsp;           subject,

&nbsp;           'sent'

&nbsp;         ]

&nbsp;       );

&nbsp;     }

&nbsp;     

&nbsp;     res.json({ 

&nbsp;       success: true, 

&nbsp;       messageId: info.messageId,

&nbsp;       message: 'Test email sent successfully'

&nbsp;     });

&nbsp;   } catch (error) {

&nbsp;     console.error('Error sending test email:', error);

&nbsp;     

&nbsp;     // Log failed email

&nbsp;     if (req.body.templateId) {

&nbsp;       await db.query(

&nbsp;         'INSERT INTO email\_logs (template\_id, template\_type, corporate\_id, recipient\_email, subject, status, error\_message) VALUES (?, ?, ?, ?, ?, ?, ?)',

&nbsp;         \[

&nbsp;           req.body.templateId,

&nbsp;           req.body.templateId.startsWith('corp\_') ? 'corporate' : 'base',

&nbsp;           req.body.corporateId || null,

&nbsp;           req.body.recipientEmail,

&nbsp;           req.body.subject,

&nbsp;           'failed',

&nbsp;           error.message

&nbsp;         ]

&nbsp;       );

&nbsp;     }

&nbsp;     

&nbsp;     res.status(500).json({ error: 'Failed to send email', details: error.message });

&nbsp;   }

&nbsp; }

);



module.exports = router;

```



\*\*File: `app.js` (Main Express App)\*\*



```javascript

const express = require('express');

const cors = require('cors');

const helmet = require('helmet');

const rateLimit = require('express-rate-limit');

require('dotenv').config();



const app = express();



// Middleware

app.use(helmet());

app.use(cors({

&nbsp; origin: process.env.FRONTEND\_URL || 'http://localhost:5173',

&nbsp; credentials: true

}));

app.use(express.json({ limit: '50mb' }));

app.use(express.urlencoded({ extended: true, limit: '50mb' }));



// Rate limiting

const limiter = rateLimit({

&nbsp; windowMs: 15 \* 60 \* 1000, // 15 minutes

&nbsp; max: 100 // limit each IP to 100 requests per windowMs

});

app.use('/api/', limiter);



// Email rate limiting (more restrictive)

const emailLimiter = rateLimit({

&nbsp; windowMs: 60 \* 60 \* 1000, // 1 hour

&nbsp; max: 10 // limit to 10 test emails per hour per IP

});



// Routes

const baseTemplatesRouter = require('./routes/baseTemplates');

const corporateTemplatesRouter = require('./routes/corporateTemplates');

const tenantsRouter = require('./routes/tenants');

const emailsRouter = require('./routes/emails');



app.use('/api/base-templates', baseTemplatesRouter);

app.use('/api/corporate-templates', corporateTemplatesRouter);

app.use('/api/tenants', tenantsRouter);

app.use('/api/emails', emailLimiter, emailsRouter);



// Health check

app.get('/api/health', (req, res) => {

&nbsp; res.json({ status: 'ok', timestamp: new Date().toISOString() });

});



// Error handling middleware

app.use((error, req, res, next) => {

&nbsp; console.error('Error:', error);

&nbsp; 

&nbsp; if (error instanceof multer.MulterError) {

&nbsp;   if (error.code === 'LIMIT\_FILE\_SIZE') {

&nbsp;     return res.status(400).json({ error: 'File size too large. Maximum 10MB allowed.' });

&nbsp;   }

&nbsp;   if (error.code === 'LIMIT\_FILE\_COUNT') {

&nbsp;     return res.status(400).json({ error: 'Too many files. Maximum 5 files allowed.' });

&nbsp;   }

&nbsp; }

&nbsp; 

&nbsp; res.status(500).json({ error: 'Internal server error' });

});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

&nbsp; console.log(`Server running on port ${PORT}`);

});



module.exports = app;

```



\*\*File: `config/database.js`\*\*



```javascript

const mysql = require('mysql2/promise');



const pool = mysql.createPool({

&nbsp; host: process.env.DB\_HOST || 'localhost',

&nbsp; user: process.env.DB\_USER,

&nbsp; password: process.env.DB\_PASSWORD,

&nbsp; database: process.env.DB\_NAME,

&nbsp; waitForConnections: true,

&nbsp; connectionLimit: 10,

&nbsp; queueLimit: 0

});



module.exports = pool;

```



\*\*File: `.env.example`\*\*



```env

\# Database

DB\_HOST=localhost

DB\_USER=your\_db\_user

DB\_PASSWORD=your\_db\_password

DB\_NAME=your\_db\_name



\# Email

SMTP\_HOST=smtp.example.com

SMTP\_PORT=587

SMTP\_SECURE=false

SMTP\_USER=your\_smtp\_user

SMTP\_PASS=your\_smtp\_password

FROM\_EMAIL=noreply@yourdomain.com



\# Server

PORT=3000

NODE\_ENV=development

FRONTEND\_URL=http://localhost:5173

```



---



\## 📦 Required npm Packages



```json

{

&nbsp; "dependencies": {

&nbsp;   "express": "^4.18.2",

&nbsp;   "mysql2": "^3.6.0",

&nbsp;   "nodemailer": "^6.9.5",

&nbsp;   "multer": "^1.4.5-lts.1",

&nbsp;   "express-validator": "^7.0.1",

&nbsp;   "cors": "^2.8.5",

&nbsp;   "helmet": "^7.0.0",

&nbsp;   "express-rate-limit": "^6.10.0",

&nbsp;   "dotenv": "^16.3.1"

&nbsp; },

&nbsp; "devDependencies": {

&nbsp;   "nodemon": "^3.0.1"

&nbsp; }

}

```



Install with:

```bash

npm install express mysql2 nodemailer multer express-validator cors helmet express-rate-limit dotenv

npm install --save-dev nodemon

```



---



\## 🚀 Running the Backend



```bash

\# Install dependencies

npm install



\# Set up environment variables

cp .env.example .env

\# Edit .env with your values



\# Run database migrations

\# (Execute the SQL schema provided above)



\# Start the server

npm start



\# Or with nodemon for development

npx nodemon app.js

```



---



\## 🧪 Testing Endpoints



Use curl or Postman to test:



```bash

\# Get all base templates

curl http://localhost:3000/api/base-templates



\# Create a base template

curl -X POST http://localhost:3000/api/base-templates \\

&nbsp; -H "Content-Type: application/json" \\

&nbsp; -d '{

&nbsp;   "name": "Welcome Email",

&nbsp;   "subject": "Welcome to Your Benefits Portal",

&nbsp;   "content": "<h1>Welcome!</h1><p>We are excited to have you.</p>",

&nbsp;   "eventType": "enrollment",

&nbsp;   "description": "Welcome email for new employees"

&nbsp; }'



\# Get tenants

curl http://localhost:3000/api/tenants



\# Send test email

curl -X POST http://localhost:3000/api/emails/test \\

&nbsp; -H "Content-Type: application/json" \\

&nbsp; -d '{

&nbsp;   "recipientEmail": "test@example.com",

&nbsp;   "subject": "Test Subject",

&nbsp;   "content": "<p>Test email content</p>"

&nbsp; }'

```



---



This backend implementation is production-ready and includes:

\- ✅ Input validation

\- ✅ Error handling

\- ✅ Rate limiting

\- ✅ Security headers

\- ✅ File upload validation

\- ✅ Email logging

\- ✅ Database connection pooling

\- ✅ CORS configuration



