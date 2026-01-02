# BenefitNest Backend - NestJS

Enterprise Insurance & Employee Benefits Platform - NestJS Backend

## Overview

This is the backend API for BenefitNest, built with NestJS. It provides all the API endpoints for the admin panel and employee portal.

## Tech Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT with Passport
- **AI**: Groq (llama-3.3-70b-versatile) for chatbot and survey generation

## Project Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts           # Root module
├── app.controller.ts       # Health check endpoint
├── auth/                   # Authentication (JWT, guards)
├── database/               # Database configuration (Supabase)
├── corporates/             # Corporate/tenant management
├── employees/              # Employee management
├── surveys/                # Survey management with AI generation
├── chatbot/                # AI-powered chatbot
├── events/                 # Events management
├── escalation/             # Escalation/tickets management
├── wellness/               # Wellness programs & challenges
├── portal/                 # Portal configuration
├── masters/                # Master data (relationships, departments, etc.)
├── document/               # Document management
├── email-templates/        # Email template management
└── claims-analytics/       # Claims analytics & reporting
```

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key

# Authentication
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key

# AI
GROQ_API_KEY=your_groq_api_key

# Server
PORT=10000
```

### Development

```bash
# Development mode with watch
npm run start:dev

# Production build
npm run build

# Production start
npm run start:prod
```

## API Endpoints

All endpoints are prefixed with `/api`.

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/register` - Admin registration

### Corporates
- `GET /api/admin/corporates` - List all corporates
- `POST /api/admin/corporates` - Create corporate
- `GET /api/admin/corporates/:id` - Get corporate details
- `PUT /api/admin/corporates/:id` - Update corporate
- `DELETE /api/admin/corporates/:id` - Delete corporate

### Employees
- `GET /api/admin/employees` - List employees
- `POST /api/admin/employees` - Create employee
- `POST /api/admin/employees/bulk-import` - Bulk import employees
- `POST /api/employee/login` - Employee login

### Surveys
- `GET /api/admin/surveys` - List surveys
- `POST /api/admin/surveys/generate` - AI-generate survey questions
- `POST /api/surveys/:id/responses` - Submit survey response

### Chatbot
- `POST /api/chatbot/start` - Start conversation
- `POST /api/chatbot/message` - Send message
- `POST /api/chatbot/end` - End conversation

### And many more...

## Deployment

### Render

1. Connect your GitHub repository
2. Set build command: `npm install && npm run build`
3. Set start command: `npm run start:prod`
4. Add environment variables
5. Deploy

## Frontend Compatibility

This NestJS backend maintains full API compatibility with the previous Express.js backend. The frontend does not require any changes.

## License

MIT
