\# Email Template Manager - Complete Integration Guide



\## 📋 Project Overview



This is a \*\*Corporate Email Template Management System\*\* designed for employee benefit platforms. It allows administrators to create, customize, and test email templates for different corporate tenants (organizations).



\### Purpose

\- Manage base email templates for various events (enrollment, wellness, surveys, benefits, claims, renewal)

\- Customize templates per corporate tenant without affecting base templates

\- Test emails with attachments before deployment

\- Maintain template library with rich text editing capabilities



---



\## 🏗️ Architecture Overview



\### Key Concepts



1\. \*\*Base Templates\*\*: Generic email templates stored in one table, used as starting points

2\. \*\*Corporate Templates\*\*: Customized versions of base templates, specific to each tenant (corporate)

3\. \*\*Tenant Isolation\*\*: Each corporate's customizations are stored separately and linked via `tenant\_id` / `corporateId`



\### Data Model



```

┌─────────────────────────────────┐

│     base\_templates              │

├─────────────────────────────────┤

│ id (PK)                         │

│ name                            │

│ subject                         │

│ content (HTML)                  │

│ event\_type                      │

│ description                     │

│ created\_at                      │

│ updated\_at                      │

└─────────────────────────────────┘

&nbsp;        ↓ (referenced by)

┌─────────────────────────────────┐

│   corporate\_templates           │

├─────────────────────────────────┤

│ id (PK)                         │

│ base\_template\_id (FK)           │

│ corporate\_id (FK) / tenant\_id   │ ← Links to your tenants table

│ name                            │

│ subject                         │

│ content (HTML)                  │

│ created\_at                      │

│ updated\_at                      │

└─────────────────────────────────┘

&nbsp;        ↑ (links to)

┌─────────────────────────────────┐

│        tenants                  │

├─────────────────────────────────┤

│ tenant\_id (PK)                  │

│ corporate\_legal\_name            │

│ ... (your existing fields)      │

└─────────────────────────────────┘

```



---



\## 🗄️ Database Schema



\### Table: `base\_templates`



```sql

CREATE TABLE base\_templates (

&nbsp;   id VARCHAR(50) PRIMARY KEY,

&nbsp;   name VARCHAR(255) NOT NULL,

&nbsp;   subject VARCHAR(500) NOT NULL,

&nbsp;   content TEXT NOT NULL,

&nbsp;   event\_type VARCHAR(50) NOT NULL,

&nbsp;   description TEXT,

&nbsp;   created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,

&nbsp;   updated\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,

&nbsp;   

&nbsp;   INDEX idx\_event\_type (event\_type),

&nbsp;   INDEX idx\_created\_at (created\_at)

);

```



\*\*Event Types:\*\*

\- `enrollment` - Employee enrollment events

\- `wellness` - Wellness program communications

\- `survey` - Survey participation requests

\- `benefits` - Benefits information and updates

\- `claims` - Claims processing notifications

\- `renewal` - Policy renewal reminders

\- `general` - General communications



\### Table: `corporate\_templates`



```sql

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

&nbsp;   FOREIGN KEY (base\_template\_id) REFERENCES base\_templates(id) ON DELETE CASCADE,

&nbsp;   FOREIGN KEY (corporate\_id) REFERENCES tenants(tenant\_id) ON DELETE CASCADE,

&nbsp;   

&nbsp;   INDEX idx\_corporate\_id (corporate\_id),

&nbsp;   INDEX idx\_base\_template\_id (base\_template\_id),

&nbsp;   INDEX idx\_created\_at (created\_at),

&nbsp;   UNIQUE KEY unique\_corporate\_base (corporate\_id, base\_template\_id)

);

```



\*\*Note:\*\* The `UNIQUE KEY` ensures each corporate can only have one customization per base template.



\### Linking to Your Existing `tenants` Table



Replace `corporate\_id` references with your existing `tenant\_id`:



```sql

-- If you need to rename in the app

FOREIGN KEY (corporate\_id) REFERENCES tenants(tenant\_id)

```



In the TypeScript code, you can map:

```typescript

corporate\_id → tenant\_id

corporate\_legal\_name → corporate name

```



---



\## 📁 Project Structure



```

src/

├── App.tsx                          # Main application component

├── components/

│   ├── TemplateCard.tsx             # Template card display

│   ├── TemplateEditor.tsx           # Rich text editor sheet

│   ├── RichTextEditor.tsx           # Rich text editing toolbar

│   ├── TestEmailDialog.tsx          # Test email sender dialog

│   ├── TemplatePreviewDialog.tsx    # Template preview modal

│   └── ui/                          # Shadcn UI components

├── lib/

│   ├── types.ts                     # TypeScript type definitions

│   └── utils.ts                     # Utility functions

├── index.css                        # Theme and global styles

└── main.tsx                         # App entry point



Database (Backend):

├── base\_templates                   # Base template table

├── corporate\_templates              # Corporate customization table

└── tenants                          # Your existing tenants table

```



---



\## 🔧 Technology Stack



\### Frontend (Current Implementation)

\- \*\*React 19\*\* with TypeScript

\- \*\*Vite\*\* - Build tool

\- \*\*Tailwind CSS 4\*\* - Styling

\- \*\*Shadcn UI v4\*\* - Component library

\- \*\*Phosphor Icons\*\* - Icon library

\- \*\*Sonner\*\* - Toast notifications

\- \*\*Framer Motion\*\* - Animations



\### Backend Integration Needed

\- \*\*Database\*\*: MySQL/PostgreSQL (recommended)

\- \*\*API\*\*: REST or GraphQL endpoints

\- \*\*Email Service\*\*: SMTP server or service (SendGrid, AWS SES, etc.)

\- \*\*File Storage\*\*: For email attachments (S3, Azure Blob, local storage)



---



\## 🔌 API Endpoints Required



You'll need to implement these backend endpoints to integrate with your existing project:



\### 1. Base Templates



```typescript

// GET /api/base-templates

// Returns: BaseTemplate\[]

GET /api/base-templates

Query params: ?eventType=enrollment\&search=welcome



// GET /api/base-templates/:id

// Returns: BaseTemplate

GET /api/base-templates/base\_123456



// POST /api/base-templates

// Body: { name, subject, content, eventType, description }

// Returns: BaseTemplate

POST /api/base-templates



// PUT /api/base-templates/:id

// Body: { name, subject, content, eventType, description }

// Returns: BaseTemplate

PUT /api/base-templates/base\_123456



// DELETE /api/base-templates/:id

// Returns: { success: boolean }

DELETE /api/base-templates/base\_123456

```



\### 2. Corporate Templates



```typescript

// GET /api/corporate-templates

// Returns: CorporateTemplate\[]

GET /api/corporate-templates

Query params: ?corporateId=tenant\_001\&search=welcome



// GET /api/corporate-templates/:id

// Returns: CorporateTemplate

GET /api/corporate-templates/corp\_123456



// POST /api/corporate-templates

// Body: { baseTemplateId, corporateId, name, subject, content }

// Returns: CorporateTemplate

POST /api/corporate-templates



// PUT /api/corporate-templates/:id

// Body: { name, subject, content }

// Returns: CorporateTemplate

PUT /api/corporate-templates/corp\_123456



// DELETE /api/corporate-templates/:id

// Returns: { success: boolean }

DELETE /api/corporate-templates/corp\_123456

```



\### 3. Tenants (Corporates)



```typescript

// GET /api/tenants

// Returns: { id: string, name: string, logo?: string }\[]

GET /api/tenants



// GET /api/tenants/:id

// Returns: { id: string, name: string, logo?: string }

GET /api/tenants/tenant\_001

```



\### 4. Test Email



```typescript

// POST /api/emails/test

// Content-Type: multipart/form-data

// Body: {

//   templateId: string,

//   recipientEmail: string,

//   isCorporateTemplate: boolean,

//   corporateId?: string,

//   subject: string,

//   content: string (HTML),

//   attachments?: File\[]

// }

// Returns: { success: boolean, messageId?: string }

POST /api/emails/test

```



---



\## 📦 Complete File References



\### 1. Type Definitions (`src/lib/types.ts`)



```typescript

export type EventType = 

&nbsp; | 'enrollment' 

&nbsp; | 'wellness' 

&nbsp; | 'survey' 

&nbsp; | 'benefits' 

&nbsp; | 'claims' 

&nbsp; | 'renewal' 

&nbsp; | 'general';



export interface BaseTemplate {

&nbsp; id: string;

&nbsp; name: string;

&nbsp; subject: string;

&nbsp; content: string;              // HTML content

&nbsp; eventType: EventType;

&nbsp; description: string;

&nbsp; createdAt: string;            // ISO 8601 format

&nbsp; updatedAt: string;            // ISO 8601 format

}



export interface Corporate {

&nbsp; id: string;                   // Maps to tenant\_id

&nbsp; name: string;                 // Maps to corporate\_legal\_name

&nbsp; logo?: string;                // Optional logo URL

}



export interface CorporateTemplate {

&nbsp; id: string;

&nbsp; baseTemplateId: string;       // FK to base\_templates.id

&nbsp; corporateId: string;          // FK to tenants.tenant\_id

&nbsp; name: string;

&nbsp; subject: string;

&nbsp; content: string;              // HTML content

&nbsp; createdAt: string;            // ISO 8601 format

&nbsp; updatedAt: string;            // ISO 8601 format

}



export interface TestEmailRequest {

&nbsp; templateId: string;

&nbsp; recipientEmail: string;

&nbsp; isCorporateTemplate: boolean;

&nbsp; corporateId?: string;

&nbsp; attachments?: File\[];

}

```



\### 2. Main Application (`src/App.tsx`)



See the complete file at `/workspaces/spark-template/src/App.tsx`



\*\*Key State Management:\*\*

```typescript

// Using @github/spark/hooks for persistent storage

const \[baseTemplates, setBaseTemplates] = useKV<BaseTemplate\[]>('base-templates', \[]);

const \[corporateTemplates, setCorporateTemplates] = useKV<CorporateTemplate\[]>('corporate-templates', \[]);

const \[corporates, setCorporates] = useKV<Corporate\[]>('corporates', \[]);

```



\*\*Important:\*\* Replace `useKV` with your API calls:

```typescript

// Example with fetch

const \[baseTemplates, setBaseTemplates] = useState<BaseTemplate\[]>(\[]);



useEffect(() => {

&nbsp; fetch('/api/base-templates')

&nbsp;   .then(res => res.json())

&nbsp;   .then(data => setBaseTemplates(data));

}, \[]);

```



\### 3. Rich Text Editor (`src/components/RichTextEditor.tsx`)



Provides:

\- Bold, Italic formatting

\- Font size selection (12-32px)

\- Font family selection

\- Bullet and numbered lists

\- Image upload (base64 embedded)



\### 4. Template Components



\- \*\*TemplateCard.tsx\*\*: Displays template with preview, edit, duplicate actions

\- \*\*TemplateEditor.tsx\*\*: Side sheet for editing template content

\- \*\*TestEmailDialog.tsx\*\*: Modal for sending test emails with attachments

\- \*\*TemplatePreviewDialog.tsx\*\*: Modal for previewing template content



---



\## 🔄 Integration Steps



\### Step 1: Set Up Database Tables



Run the SQL schema provided above in your database.



\### Step 2: Map Tenant References



Update the foreign key to point to your existing `tenants` table:



```sql

ALTER TABLE corporate\_templates 

ADD CONSTRAINT fk\_corporate\_tenant 

FOREIGN KEY (corporate\_id) REFERENCES tenants(tenant\_id);

```



\### Step 3: Create API Endpoints



Implement the API endpoints listed above using your backend framework (Express, Django, Laravel, etc.).



\*\*Example: Node.js + Express\*\*



```javascript

// GET /api/base-templates

app.get('/api/base-templates', async (req, res) => {

&nbsp; const { eventType, search } = req.query;

&nbsp; 

&nbsp; let query = 'SELECT \* FROM base\_templates WHERE 1=1';

&nbsp; const params = \[];

&nbsp; 

&nbsp; if (eventType) {

&nbsp;   query += ' AND event\_type = ?';

&nbsp;   params.push(eventType);

&nbsp; }

&nbsp; 

&nbsp; if (search) {

&nbsp;   query += ' AND (name LIKE ? OR subject LIKE ?)';

&nbsp;   params.push(`%${search}%`, `%${search}%`);

&nbsp; }

&nbsp; 

&nbsp; query += ' ORDER BY created\_at DESC';

&nbsp; 

&nbsp; const results = await db.query(query, params);

&nbsp; res.json(results);

});



// POST /api/base-templates

app.post('/api/base-templates', async (req, res) => {

&nbsp; const { name, subject, content, eventType, description } = req.body;

&nbsp; 

&nbsp; const id = `base\_${Date.now()}`;

&nbsp; 

&nbsp; await db.query(

&nbsp;   'INSERT INTO base\_templates (id, name, subject, content, event\_type, description) VALUES (?, ?, ?, ?, ?, ?)',

&nbsp;   \[id, name, subject, content, eventType, description]

&nbsp; );

&nbsp; 

&nbsp; const template = await db.query('SELECT \* FROM base\_templates WHERE id = ?', \[id]);

&nbsp; res.json(template\[0]);

});



// Similar implementations for other endpoints...

```



\### Step 4: Replace Frontend Storage



Replace `useKV` hooks with API calls:



```typescript

// Before (current implementation with useKV)

const \[baseTemplates, setBaseTemplates] = useKV<BaseTemplate\[]>('base-templates', \[]);



// After (with API integration)

const \[baseTemplates, setBaseTemplates] = useState<BaseTemplate\[]>(\[]);

const \[loading, setLoading] = useState(true);



useEffect(() => {

&nbsp; fetchBaseTemplates();

}, \[]);



const fetchBaseTemplates = async () => {

&nbsp; setLoading(true);

&nbsp; try {

&nbsp;   const response = await fetch('/api/base-templates');

&nbsp;   const data = await response.json();

&nbsp;   setBaseTemplates(data);

&nbsp; } catch (error) {

&nbsp;   toast.error('Failed to load templates');

&nbsp; } finally {

&nbsp;   setLoading(false);

&nbsp; }

};

```



\### Step 5: Implement Email Sending



Set up email service integration:



```javascript

// Backend: POST /api/emails/test

const nodemailer = require('nodemailer');

const multer = require('multer');



const upload = multer({ storage: multer.memoryStorage() });



app.post('/api/emails/test', upload.array('attachments'), async (req, res) => {

&nbsp; const { recipientEmail, subject, content } = req.body;

&nbsp; const attachments = req.files?.map(file => ({

&nbsp;   filename: file.originalname,

&nbsp;   content: file.buffer

&nbsp; }));

&nbsp; 

&nbsp; const transporter = nodemailer.createTransport({

&nbsp;   host: process.env.SMTP\_HOST,

&nbsp;   port: process.env.SMTP\_PORT,

&nbsp;   auth: {

&nbsp;     user: process.env.SMTP\_USER,

&nbsp;     pass: process.env.SMTP\_PASS

&nbsp;   }

&nbsp; });

&nbsp; 

&nbsp; await transporter.sendMail({

&nbsp;   from: process.env.FROM\_EMAIL,

&nbsp;   to: recipientEmail,

&nbsp;   subject: subject,

&nbsp;   html: content,

&nbsp;   attachments: attachments

&nbsp; });

&nbsp; 

&nbsp; res.json({ success: true });

});

```



\### Step 6: Update Frontend Email Handler



```typescript

const handleTestEmailSend = async (email: string, attachments: File\[]) => {

&nbsp; const formData = new FormData();

&nbsp; formData.append('recipientEmail', email);

&nbsp; formData.append('subject', testingTemplate.subject);

&nbsp; formData.append('content', testingTemplate.content);

&nbsp; 

&nbsp; attachments.forEach(file => {

&nbsp;   formData.append('attachments', file);

&nbsp; });

&nbsp; 

&nbsp; try {

&nbsp;   const response = await fetch('/api/emails/test', {

&nbsp;     method: 'POST',

&nbsp;     body: formData

&nbsp;   });

&nbsp;   

&nbsp;   if (response.ok) {

&nbsp;     toast.success(`Test email sent to ${email}`);

&nbsp;   } else {

&nbsp;     throw new Error('Failed to send email');

&nbsp;   }

&nbsp; } catch (error) {

&nbsp;   toast.error('Failed to send test email');

&nbsp; }

};

```



---



\## 🎨 Styling \& Theme



The application uses a custom color scheme defined in `src/index.css`:



```css

:root {

&nbsp; --background: oklch(0.96 0.01 250);          /\* Soft Pearl background \*/

&nbsp; --foreground: oklch(0.25 0.02 250);          /\* Dark Charcoal text \*/

&nbsp; 

&nbsp; --primary: oklch(0.45 0.15 250);             /\* Deep Corporate Blue \*/

&nbsp; --primary-foreground: oklch(0.98 0 0);       /\* White \*/

&nbsp; 

&nbsp; --accent: oklch(0.60 0.18 200);              /\* Vibrant Teal \*/

&nbsp; --accent-foreground: oklch(0.98 0 0);        /\* White \*/

&nbsp; 

&nbsp; --card: oklch(0.98 0 0);                     /\* White cards \*/

&nbsp; --border: oklch(0.85 0.01 250);              /\* Light borders \*/

&nbsp; 

&nbsp; --destructive: oklch(0.577 0.245 27.325);    /\* Red for delete \*/

&nbsp; 

&nbsp; --radius: 0.5rem;                            /\* Border radius \*/

}

```



\*\*Fonts:\*\*

\- \*\*Headings\*\*: Space Grotesk (Bold, SemiBold, Medium)

\- \*\*Body\*\*: IBM Plex Sans (Regular, Medium, SemiBold)

\- \*\*Code\*\*: JetBrains Mono



---



\## 📝 Usage Examples



\### Creating a New Base Template



1\. Click "New Template" button

2\. Fill in template name, subject, and content using rich text editor

3\. Click "Save Template"

4\. Template is stored in `base\_templates` table



\### Customizing for a Corporate



1\. Select a corporate from dropdown

2\. Click "Customize" on any base template

3\. Modify the content in the editor

4\. Click "Save Template"

5\. Customization is stored in `corporate\_templates` table with reference to both base template and corporate



\### Sending Test Email



1\. Select a corporate (required)

2\. Navigate to "Corporate Templates" tab

3\. Click "Send Test Email" on a customized template

4\. Enter recipient email

5\. Optionally attach files

6\. Click "Send Test Email"



---



\## 🔒 Security Considerations



1\. \*\*Input Sanitization\*\*: Sanitize HTML content to prevent XSS attacks

2\. \*\*File Upload Validation\*\*: Validate file types and sizes for attachments

3\. \*\*Authentication\*\*: Implement authentication to restrict access

4\. \*\*Authorization\*\*: Ensure users can only access their tenant's data

5\. \*\*Rate Limiting\*\*: Limit test email sends to prevent abuse

6\. \*\*SQL Injection\*\*: Use parameterized queries for all database operations



---



\## 🚀 Deployment Checklist



\- \[ ] Database tables created with proper indexes

\- \[ ] Foreign keys configured to link to tenants table

\- \[ ] API endpoints implemented and tested

\- \[ ] Email service configured (SMTP credentials)

\- \[ ] File storage configured for attachments

\- \[ ] Environment variables set

\- \[ ] Frontend API URLs updated

\- \[ ] Authentication/authorization implemented

\- \[ ] Error logging configured

\- \[ ] Performance testing completed



---



\## 🐛 Troubleshooting



\### Templates Not Saving



\- Check database connection

\- Verify API endpoint is receiving correct data

\- Check console for JavaScript errors

\- Verify CORS headers if frontend/backend on different domains



\### Test Emails Not Sending



\- Verify SMTP credentials

\- Check email service logs

\- Ensure recipient email is valid

\- Check attachment size limits

\- Verify firewall allows SMTP port



\### Corporate Selector Empty



\- Verify `/api/tenants` endpoint is working

\- Check that tenants table has data

\- Verify tenant\_id is being returned correctly



\### Rich Text Editor Not Working



\- Check browser console for errors

\- Verify content is being saved as HTML

\- Test with plain text first

\- Check browser compatibility (modern browsers required)



---



\## 📚 Additional Resources



\### TypeScript Interfaces



All interfaces are defined in `src/lib/types.ts` and match the database schema exactly.



\### Component Documentation



\- \*\*Shadcn UI\*\*: https://ui.shadcn.com/

\- \*\*Phosphor Icons\*\*: https://phosphoricons.com/

\- \*\*Sonner\*\*: https://sonner.emilkowal.ski/



\### API Testing



Use tools like Postman or Thunder Client to test API endpoints before integrating with frontend.



---



\## 🤝 Integration with Existing Project



\### Option 1: Standalone Module



Deploy as a separate application that shares the `tenants` database table:



```

your-project/

├── main-app/          # Your existing app

├── email-manager/     # This email template manager

└── shared-db/         # Shared database with tenants table

```



\### Option 2: Embedded Route



Integrate into your existing React application as a route:



```typescript

// In your main app router

<Route path="/email-templates" element={<EmailTemplateManager />} />

```



\### Option 3: Microservice



Deploy as a microservice with API communication:



```

\[Your Main App] <--REST API--> \[Email Template Service]

&nbsp;     ↓                                ↓

&nbsp; \[Your DB - tenants]            \[Templates DB]

```



---



\## 📧 Contact \& Support



For questions about integration, refer to:

\- Project README.md

\- PRD.md (Product Requirements Document)

\- Component source code comments



---



\*\*Last Updated\*\*: 2024

\*\*Version\*\*: 1.0.0

\*\*Status\*\*: Ready for Integration



