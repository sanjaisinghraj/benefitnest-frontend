\# 📧 Email Template Manager - Complete Package for VS Code Copilot



\## 🎯 Project Summary



This is a \*\*Corporate Email Template Management System\*\* for employee benefit platforms. It manages email templates across multiple tenant organizations (corporates) with customization capabilities, rich text editing, and test email functionality.



---



\## 📁 Complete File List



\### Documentation Files (Share ALL of these)



1\. \*\*README.md\*\* - Project overview and introduction

2\. \*\*INTEGRATION\_GUIDE.md\*\* - Complete integration documentation

3\. \*\*BACKEND\_IMPLEMENTATION.md\*\* - Backend API code and setup

4\. \*\*FRONTEND\_INTEGRATION.md\*\* - Frontend API integration guide

5\. \*\*QUICK\_START.md\*\* - Step-by-step checklist

6\. \*\*PRD.md\*\* - Product requirements document

7\. \*\*THIS FILE\*\* - Summary and package overview



\### Source Code Files



\#### Frontend (React + TypeScript)

```

src/

├── App.tsx                          # Main application (API-ready version in FRONTEND\_INTEGRATION.md)

├── components/

│   ├── TemplateCard.tsx             # Template display card

│   ├── TemplateEditor.tsx           # Template editing sheet

│   ├── RichTextEditor.tsx           # Rich text editor with toolbar

│   ├── TestEmailDialog.tsx          # Test email sending dialog

│   ├── TemplatePreviewDialog.tsx    # Template preview modal

│   └── ui/                          # Shadcn UI components (40+ components)

├── services/                        # NEW - API service layer

│   ├── api.ts                       # Base API configuration

│   ├── baseTemplates.ts             # Base templates API

│   ├── corporateTemplates.ts        # Corporate templates API

│   ├── tenants.ts                   # Tenants API

│   └── emails.ts                    # Email sending API

├── hooks/

│   ├── use-mobile.ts                # Mobile breakpoint hook

│   └── useApi.ts                    # NEW - API call wrapper hook

├── lib/

│   ├── types.ts                     # TypeScript type definitions

│   └── utils.ts                     # Utility functions

├── index.css                        # Theme and global styles

├── main.tsx                         # App entry point (DO NOT EDIT)

└── main.css                         # Structural CSS (DO NOT EDIT)

```



\#### Backend (Node.js + Express)

```

email-template-api/

├── app.js                           # Main Express application

├── config/

│   └── database.js                  # Database connection pool

├── routes/

│   ├── baseTemplates.js             # Base templates CRUD API

│   ├── corporateTemplates.js        # Corporate templates CRUD API

│   ├── tenants.js                   # Tenants API

│   └── emails.js                    # Email sending API

├── .env                             # Environment variables

└── package.json                     # Dependencies

```



\#### Database

```sql

-- Three main tables:

1\. base\_templates          # Generic email templates

2\. corporate\_templates     # Corporate-specific customizations

3\. tenants                 # Existing table in your project



-- Optional:

4\. email\_logs             # Email sending audit log

```



---



\## 🔑 Key Concepts



\### 1. Two-Tier Template System



```

Base Template (Generic)

&nbsp;   │

&nbsp;   ├─── Corporate Template A (Customized for Tenant A)

&nbsp;   ├─── Corporate Template B (Customized for Tenant B)

&nbsp;   └─── Corporate Template C (Customized for Tenant C)

```



\*\*Base Templates\*\*: 

\- Generic email templates for various events

\- Created by administrators

\- Serve as starting point for customization



\*\*Corporate Templates\*\*:

\- Customized versions of base templates

\- Specific to each tenant/corporate

\- Linked to both base template and tenant via foreign keys



\### 2. Database Relationships



```

tenants (YOUR EXISTING TABLE)

&nbsp; ↑

&nbsp; │ (tenant\_id)

&nbsp; │

corporate\_templates

&nbsp; │

&nbsp; ├─ corporate\_id → tenants.tenant\_id

&nbsp; └─ base\_template\_id → base\_templates.id

```



\### 3. Event Types



Templates are categorized by event type:

\- `enrollment` - Employee enrollment

\- `wellness` - Wellness programs

\- `survey` - Surveys

\- `benefits` - Benefits information

\- `claims` - Claims processing

\- `renewal` - Policy renewal

\- `general` - General communications



---



\## 🔄 Data Flow



\### Creating a Base Template

```

User → UI → API POST /api/base-templates → Database → Response → UI Update

```



\### Customizing for Corporate

```

1\. User selects corporate (tenant)

2\. User clicks "Customize" on base template

3\. UI loads base template content into editor

4\. User modifies content

5\. API POST /api/corporate-templates with:

&nbsp;  - baseTemplateId

&nbsp;  - corporateId (tenant\_id)

&nbsp;  - customized content

6\. Database stores in corporate\_templates table

7\. Unique constraint ensures one customization per corporate per base template

```



\### Sending Test Email

```

1\. User selects corporate template

2\. Clicks "Send Test Email"

3\. Enters recipient email

4\. Optionally adds attachments

5\. API POST /api/emails/test with FormData

6\. Backend sends via SMTP

7\. Success/failure response

8\. Log entry created

```



---



\## 🗄️ Database Schema Quick Reference



\### base\_templates

| Column      | Type         | Description                    |

|-------------|--------------|--------------------------------|

| id          | VARCHAR(50)  | Primary Key (e.g., base\_123)  |

| name        | VARCHAR(255) | Template name                  |

| subject     | VARCHAR(500) | Email subject line             |

| content     | TEXT         | HTML email content             |

| event\_type  | ENUM         | Event category                 |

| description | TEXT         | Template description           |

| created\_at  | TIMESTAMP    | Creation timestamp             |

| updated\_at  | TIMESTAMP    | Last update timestamp          |



\### corporate\_templates

| Column           | Type         | Description                        |

|------------------|--------------|------------------------------------|

| id               | VARCHAR(50)  | Primary Key (e.g., corp\_123)      |

| base\_template\_id | VARCHAR(50)  | FK → base\_templates.id            |

| corporate\_id     | VARCHAR(50)  | FK → tenants.tenant\_id            |

| name             | VARCHAR(255) | Customized template name           |

| subject          | VARCHAR(500) | Customized email subject           |

| content          | TEXT         | Customized HTML content            |

| created\_at       | TIMESTAMP    | Creation timestamp                 |

| updated\_at       | TIMESTAMP    | Last update timestamp              |



\*\*Unique Constraint\*\*: `(corporate\_id, base\_template\_id)` - Each corporate can have only one customization per base template.



---



\## 🔌 API Endpoints Reference



\### Base Templates

```

GET    /api/base-templates              # List all

GET    /api/base-templates/:id          # Get one

POST   /api/base-templates              # Create

PUT    /api/base-templates/:id          # Update

DELETE /api/base-templates/:id          # Delete



Query params: ?eventType=enrollment\&search=welcome

```



\### Corporate Templates

```

GET    /api/corporate-templates         # List all

GET    /api/corporate-templates/:id     # Get one

POST   /api/corporate-templates         # Create

PUT    /api/corporate-templates/:id     # Update

DELETE /api/corporate-templates/:id     # Delete



Query params: ?corporateId=tenant\_001\&search=welcome

```



\### Tenants

```

GET    /api/tenants                     # List all tenants

GET    /api/tenants/:id                 # Get one tenant

```



\### Emails

```

POST   /api/emails/test                 # Send test email

Content-Type: multipart/form-data

Body: recipientEmail, subject, content, attachments\[]

```



---



\## 🎨 Tech Stack



\### Frontend

\- \*\*React 19\*\* - UI library

\- \*\*TypeScript\*\* - Type safety

\- \*\*Vite\*\* - Build tool

\- \*\*Tailwind CSS 4\*\* - Styling

\- \*\*Shadcn UI v4\*\* - Component library

\- \*\*Phosphor Icons\*\* - Icons

\- \*\*Sonner\*\* - Toast notifications

\- \*\*Framer Motion\*\* - Animations



\### Backend

\- \*\*Node.js\*\* - Runtime

\- \*\*Express\*\* - Web framework

\- \*\*MySQL2\*\* - Database driver

\- \*\*Nodemailer\*\* - Email sending

\- \*\*Multer\*\* - File uploads

\- \*\*Express Validator\*\* - Input validation



\### Database

\- \*\*MySQL\*\* or \*\*PostgreSQL\*\*



---



\## 🚀 Quick Integration Steps



\### For VS Code Copilot Context



When working with VS Code Copilot, share these files in order:



1\. \*\*INTEGRATION\_GUIDE.md\*\* - Complete overview

2\. \*\*src/lib/types.ts\*\* - Type definitions

3\. \*\*BACKEND\_IMPLEMENTATION.md\*\* - Backend code

4\. \*\*FRONTEND\_INTEGRATION.md\*\* - Frontend integration

5\. \*\*QUICK\_START.md\*\* - Step-by-step guide



\### Prompt for VS Code Copilot



```

I am integrating an Email Template Manager into my existing project. 



My existing setup:

\- Database: \[MySQL/PostgreSQL]

\- Backend: \[Node.js/Other]

\- Existing table: tenants with tenant\_id and corporate\_legal\_name



Please help me:

1\. Set up the database tables

2\. Create the backend API routes

3\. Integrate the frontend with my API

4\. Configure email sending



I have the following documentation files available:

\- INTEGRATION\_GUIDE.md

\- BACKEND\_IMPLEMENTATION.md

\- FRONTEND\_INTEGRATION.md

\- QUICK\_START.md



\[Paste relevant section from documentation]

```



---



\## 📋 Integration Checklist



\### Phase 1: Database (Day 1)

\- \[ ] Create `base\_templates` table

\- \[ ] Create `corporate\_templates` table  

\- \[ ] Create `email\_logs` table (optional)

\- \[ ] Set up foreign keys to `tenants` table

\- \[ ] Test foreign key constraints

\- \[ ] Insert sample data



\### Phase 2: Backend (Day 1-2)

\- \[ ] Set up Node.js project

\- \[ ] Install dependencies

\- \[ ] Configure database connection

\- \[ ] Implement base templates API

\- \[ ] Implement corporate templates API

\- \[ ] Implement tenants API

\- \[ ] Implement email sending API

\- \[ ] Configure SMTP

\- \[ ] Test all endpoints



\### Phase 3: Frontend (Day 2-3)

\- \[ ] Review existing frontend code

\- \[ ] Create API service layer

\- \[ ] Create custom hooks

\- \[ ] Update App.tsx with API calls

\- \[ ] Replace useKV with useState

\- \[ ] Add loading states

\- \[ ] Add error handling

\- \[ ] Configure environment variables

\- \[ ] Test all features



\### Phase 4: Testing (Day 3)

\- \[ ] Test corporate selection

\- \[ ] Test base template CRUD

\- \[ ] Test corporate template CRUD

\- \[ ] Test template customization flow

\- \[ ] Test search and filtering

\- \[ ] Test rich text editor

\- \[ ] Test email sending

\- \[ ] Test file attachments

\- \[ ] Test error scenarios



\### Phase 5: Deployment (Day 4)

\- \[ ] Deploy backend API

\- \[ ] Deploy frontend

\- \[ ] Configure production database

\- \[ ] Set up SSL/HTTPS

\- \[ ] Update CORS settings

\- \[ ] Configure production SMTP

\- \[ ] Test production environment

\- \[ ] Monitor logs



---



\## 🔒 Security Considerations



1\. \*\*Input Validation\*\*: All API endpoints validate input

2\. \*\*SQL Injection\*\*: Parameterized queries used

3\. \*\*XSS Prevention\*\*: HTML content sanitization needed

4\. \*\*File Upload\*\*: File type and size validation

5\. \*\*Rate Limiting\*\*: Implemented on API routes

6\. \*\*CORS\*\*: Configured for specific origins

7\. \*\*Environment Variables\*\*: Sensitive data in .env

8\. \*\*Email Validation\*\*: Email addresses validated



---



\## 📊 Sample Data



\### Sample Base Template

```json

{

&nbsp; "id": "base\_001",

&nbsp; "name": "Welcome Email",

&nbsp; "subject": "Welcome to Your Benefits Portal",

&nbsp; "content": "<h1>Welcome!</h1><p>We are excited to have you.</p>",

&nbsp; "eventType": "enrollment",

&nbsp; "description": "Welcome email for new employees",

&nbsp; "createdAt": "2024-01-01T00:00:00Z",

&nbsp; "updatedAt": "2024-01-01T00:00:00Z"

}

```



\### Sample Corporate Template

```json

{

&nbsp; "id": "corp\_001",

&nbsp; "baseTemplateId": "base\_001",

&nbsp; "corporateId": "tenant\_001",

&nbsp; "name": "Welcome Email (Acme Corp)",

&nbsp; "subject": "Welcome to Acme Corp Benefits",

&nbsp; "content": "<h1>Welcome to Acme Corp!</h1><p>Custom content here.</p>",

&nbsp; "createdAt": "2024-01-01T00:00:00Z",

&nbsp; "updatedAt": "2024-01-01T00:00:00Z"

}

```



---



\## 🐛 Common Issues \& Solutions



\### Issue: Foreign key constraint fails

\*\*Solution\*\*: Verify tenant\_id exists in tenants table before creating corporate template



\### Issue: Email not sending

\*\*Solution\*\*: Check SMTP credentials, try Gmail App Password instead of regular password



\### Issue: CORS error

\*\*Solution\*\*: Ensure frontend URL is in CORS origin list in backend



\### Issue: Templates not loading

\*\*Solution\*\*: Check API endpoint URL in .env, verify backend is running



\### Issue: Rich text editor images too large

\*\*Solution\*\*: Images are embedded as base64, limit size to 2MB per image



---



\## 📞 Support \& Documentation



\### Main Documentation Files

1\. \*\*INTEGRATION\_GUIDE.md\*\* (19KB) - Complete integration guide

2\. \*\*BACKEND\_IMPLEMENTATION.md\*\* (25KB) - Backend code and SQL

3\. \*\*FRONTEND\_INTEGRATION.md\*\* (21KB) - Frontend API integration  

4\. \*\*QUICK\_START.md\*\* (15KB) - Step-by-step checklist

5\. \*\*PRD.md\*\* (14KB) - Product requirements



\### Key Source Files

1\. \*\*src/App.tsx\*\* - Main application

2\. \*\*src/lib/types.ts\*\* - TypeScript types

3\. \*\*src/components/\*\* - All UI components



\### Database Schema

\- Complete SQL in \*\*BACKEND\_IMPLEMENTATION.md\*\*

\- Both MySQL and PostgreSQL versions included



\### API Implementation

\- Complete Express routes in \*\*BACKEND\_IMPLEMENTATION.md\*\*

\- Includes validation, error handling, rate limiting



---



\## ✨ Features Included



\### Core Features

✅ Base template management (CRUD)

✅ Corporate template customization

✅ Rich text editor (bold, italic, fonts, images, lists)

✅ Template preview

✅ Test email sending

✅ File attachments (up to 10MB)

✅ Search and filtering

✅ Tenant/corporate selection

✅ Event type categorization



\### Technical Features

✅ TypeScript type safety

✅ API service layer

✅ Loading states

✅ Error handling

✅ Toast notifications

✅ Responsive design

✅ Form validation

✅ File upload validation

✅ Rate limiting

✅ CORS configuration

✅ Database connection pooling

✅ Email logging



---



\## 🎯 What to Share with VS Code Copilot



\### Minimum Set (Quick Start)

1\. \*\*This file\*\* (EMAIL\_COPILOT\_PACKAGE.md)

2\. \*\*QUICK\_START.md\*\*

3\. \*\*src/lib/types.ts\*\*



\### Full Set (Complete Integration)

1\. All documentation files (7 files)

2\. All source code files

3\. Database schema

4\. API endpoint specifications



\### For Specific Tasks



\*\*For Database Setup:\*\*

\- BACKEND\_IMPLEMENTATION.md (SQL section)



\*\*For Backend API:\*\*

\- BACKEND\_IMPLEMENTATION.md (full)

\- src/lib/types.ts



\*\*For Frontend Integration:\*\*

\- FRONTEND\_INTEGRATION.md (full)

\- src/App.tsx

\- src/lib/types.ts



---



\## 📝 Final Notes



This is a \*\*production-ready\*\* email template management system with:

\- ✅ Complete source code

\- ✅ Database schema

\- ✅ API implementation

\- ✅ Frontend components

\- ✅ Integration guides

\- ✅ Testing procedures

\- ✅ Deployment instructions



\*\*All files are ready to use\*\* - copy the code from the documentation files into your project and follow the QUICK\_START.md checklist.



\*\*Estimated Integration Time\*\*: 2-4 days depending on your existing infrastructure



\*\*Support\*\*: Refer to documentation files for troubleshooting and detailed explanations



---



\*\*Ready to integrate! Share this package with your VS Code Copilot to get started. 🚀\*\*



