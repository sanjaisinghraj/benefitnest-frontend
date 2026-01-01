\# Frontend API Integration Guide



This document shows how to modify the existing frontend code to integrate with your backend API instead of using the `useKV` hooks.



---



\## 🔄 Overview



The current implementation uses `@github/spark/hooks` (specifically `useKV`) for data persistence. To integrate with your backend, you'll need to:



1\. Create API service functions

2\. Replace `useKV` hooks with `useState` and `useEffect`

3\. Update CRUD operations to call API endpoints

4\. Add loading and error states



---



\## 📁 File Structure



Create these new files:



```

src/

├── services/

│   ├── api.ts                    # Base API configuration

│   ├── baseTemplates.ts          # Base templates API calls

│   ├── corporateTemplates.ts     # Corporate templates API calls

│   ├── tenants.ts                # Tenants API calls

│   └── emails.ts                 # Email sending API calls

└── hooks/

&nbsp;   └── useApi.ts                 # Custom hook for API calls

```



---



\## 🛠️ Step 1: Create API Configuration



\*\*File: `src/services/api.ts`\*\*



```typescript

const API\_BASE\_URL = import.meta.env.VITE\_API\_BASE\_URL || 'http://localhost:3000/api';



export interface ApiError {

&nbsp; error: string;

&nbsp; details?: string;

&nbsp; errors?: Array<{ msg: string; param: string }>;

}



export class ApiException extends Error {

&nbsp; constructor(public status: number, public data: ApiError) {

&nbsp;   super(data.error);

&nbsp;   this.name = 'ApiException';

&nbsp; }

}



async function handleResponse<T>(response: Response): Promise<T> {

&nbsp; if (!response.ok) {

&nbsp;   const error = await response.json().catch(() => ({ 

&nbsp;     error: `HTTP ${response.status}: ${response.statusText}` 

&nbsp;   }));

&nbsp;   throw new ApiException(response.status, error);

&nbsp; }

&nbsp; 

&nbsp; return response.json();

}



export async function apiGet<T>(endpoint: string, params?: Record<string, string>): Promise<T> {

&nbsp; const url = new URL(`${API\_BASE\_URL}${endpoint}`);

&nbsp; 

&nbsp; if (params) {

&nbsp;   Object.entries(params).forEach((\[key, value]) => {

&nbsp;     if (value) url.searchParams.append(key, value);

&nbsp;   });

&nbsp; }

&nbsp; 

&nbsp; const response = await fetch(url.toString(), {

&nbsp;   method: 'GET',

&nbsp;   headers: {

&nbsp;     'Content-Type': 'application/json',

&nbsp;   },

&nbsp; });

&nbsp; 

&nbsp; return handleResponse<T>(response);

}



export async function apiPost<T>(endpoint: string, data: unknown): Promise<T> {

&nbsp; const response = await fetch(`${API\_BASE\_URL}${endpoint}`, {

&nbsp;   method: 'POST',

&nbsp;   headers: {

&nbsp;     'Content-Type': 'application/json',

&nbsp;   },

&nbsp;   body: JSON.stringify(data),

&nbsp; });

&nbsp; 

&nbsp; return handleResponse<T>(response);

}



export async function apiPut<T>(endpoint: string, data: unknown): Promise<T> {

&nbsp; const response = await fetch(`${API\_BASE\_URL}${endpoint}`, {

&nbsp;   method: 'PUT',

&nbsp;   headers: {

&nbsp;     'Content-Type': 'application/json',

&nbsp;   },

&nbsp;   body: JSON.stringify(data),

&nbsp; });

&nbsp; 

&nbsp; return handleResponse<T>(response);

}



export async function apiDelete<T>(endpoint: string): Promise<T> {

&nbsp; const response = await fetch(`${API\_BASE\_URL}${endpoint}`, {

&nbsp;   method: 'DELETE',

&nbsp;   headers: {

&nbsp;     'Content-Type': 'application/json',

&nbsp;   },

&nbsp; });

&nbsp; 

&nbsp; return handleResponse<T>(response);

}



export async function apiPostFormData<T>(endpoint: string, formData: FormData): Promise<T> {

&nbsp; const response = await fetch(`${API\_BASE\_URL}${endpoint}`, {

&nbsp;   method: 'POST',

&nbsp;   body: formData,

&nbsp; });

&nbsp; 

&nbsp; return handleResponse<T>(response);

}

```



---



\## 🛠️ Step 2: Create API Service Functions



\*\*File: `src/services/baseTemplates.ts`\*\*



```typescript

import { apiGet, apiPost, apiPut, apiDelete } from './api';

import type { BaseTemplate } from '@/lib/types';



export interface BaseTemplateCreateData {

&nbsp; name: string;

&nbsp; subject: string;

&nbsp; content: string;

&nbsp; eventType: string;

&nbsp; description: string;

}



export interface BaseTemplateUpdateData {

&nbsp; name: string;

&nbsp; subject: string;

&nbsp; content: string;

&nbsp; eventType: string;

&nbsp; description: string;

}



export async function getBaseTemplates(params?: {

&nbsp; eventType?: string;

&nbsp; search?: string;

}): Promise<BaseTemplate\[]> {

&nbsp; return apiGet<BaseTemplate\[]>('/base-templates', params);

}



export async function getBaseTemplate(id: string): Promise<BaseTemplate> {

&nbsp; return apiGet<BaseTemplate>(`/base-templates/${id}`);

}



export async function createBaseTemplate(data: BaseTemplateCreateData): Promise<BaseTemplate> {

&nbsp; return apiPost<BaseTemplate>('/base-templates', data);

}



export async function updateBaseTemplate(

&nbsp; id: string, 

&nbsp; data: BaseTemplateUpdateData

): Promise<BaseTemplate> {

&nbsp; return apiPut<BaseTemplate>(`/base-templates/${id}`, data);

}



export async function deleteBaseTemplate(id: string): Promise<{ success: boolean }> {

&nbsp; return apiDelete<{ success: boolean }>(`/base-templates/${id}`);

}

```



\*\*File: `src/services/corporateTemplates.ts`\*\*



```typescript

import { apiGet, apiPost, apiPut, apiDelete } from './api';

import type { CorporateTemplate } from '@/lib/types';



export interface CorporateTemplateCreateData {

&nbsp; baseTemplateId: string;

&nbsp; corporateId: string;

&nbsp; name: string;

&nbsp; subject: string;

&nbsp; content: string;

}



export interface CorporateTemplateUpdateData {

&nbsp; name: string;

&nbsp; subject: string;

&nbsp; content: string;

}



export async function getCorporateTemplates(params?: {

&nbsp; corporateId?: string;

&nbsp; search?: string;

}): Promise<CorporateTemplate\[]> {

&nbsp; return apiGet<CorporateTemplate\[]>('/corporate-templates', params);

}



export async function getCorporateTemplate(id: string): Promise<CorporateTemplate> {

&nbsp; return apiGet<CorporateTemplate>(`/corporate-templates/${id}`);

}



export async function createCorporateTemplate(

&nbsp; data: CorporateTemplateCreateData

): Promise<CorporateTemplate> {

&nbsp; return apiPost<CorporateTemplate>('/corporate-templates', data);

}



export async function updateCorporateTemplate(

&nbsp; id: string,

&nbsp; data: CorporateTemplateUpdateData

): Promise<CorporateTemplate> {

&nbsp; return apiPut<CorporateTemplate>(`/corporate-templates/${id}`, data);

}



export async function deleteCorporateTemplate(id: string): Promise<{ success: boolean }> {

&nbsp; return apiDelete<{ success: boolean }>(`/corporate-templates/${id}`);

}

```



\*\*File: `src/services/tenants.ts`\*\*



```typescript

import { apiGet } from './api';

import type { Corporate } from '@/lib/types';



export async function getTenants(): Promise<Corporate\[]> {

&nbsp; return apiGet<Corporate\[]>('/tenants');

}



export async function getTenant(id: string): Promise<Corporate> {

&nbsp; return apiGet<Corporate>(`/tenants/${id}`);

}

```



\*\*File: `src/services/emails.ts`\*\*



```typescript

import { apiPostFormData } from './api';



export interface SendTestEmailData {

&nbsp; recipientEmail: string;

&nbsp; subject: string;

&nbsp; content: string;

&nbsp; templateId?: string;

&nbsp; corporateId?: string;

&nbsp; attachments?: File\[];

}



export interface SendTestEmailResponse {

&nbsp; success: boolean;

&nbsp; messageId?: string;

&nbsp; message: string;

}



export async function sendTestEmail(data: SendTestEmailData): Promise<SendTestEmailResponse> {

&nbsp; const formData = new FormData();

&nbsp; 

&nbsp; formData.append('recipientEmail', data.recipientEmail);

&nbsp; formData.append('subject', data.subject);

&nbsp; formData.append('content', data.content);

&nbsp; 

&nbsp; if (data.templateId) {

&nbsp;   formData.append('templateId', data.templateId);

&nbsp; }

&nbsp; 

&nbsp; if (data.corporateId) {

&nbsp;   formData.append('corporateId', data.corporateId);

&nbsp; }

&nbsp; 

&nbsp; if (data.attachments) {

&nbsp;   data.attachments.forEach(file => {

&nbsp;     formData.append('attachments', file);

&nbsp;   });

&nbsp; }

&nbsp; 

&nbsp; return apiPostFormData<SendTestEmailResponse>('/emails/test', formData);

}

```



---



\## 🛠️ Step 3: Create Custom Hook



\*\*File: `src/hooks/useApi.ts`\*\*



```typescript

import { useState, useCallback } from 'react';

import { ApiException } from '@/services/api';

import { toast } from 'sonner';



export function useApi<T, Args extends unknown\[]>(

&nbsp; apiFunction: (...args: Args) => Promise<T>

) {

&nbsp; const \[data, setData] = useState<T | null>(null);

&nbsp; const \[loading, setLoading] = useState(false);

&nbsp; const \[error, setError] = useState<string | null>(null);



&nbsp; const execute = useCallback(

&nbsp;   async (...args: Args) => {

&nbsp;     setLoading(true);

&nbsp;     setError(null);

&nbsp;     

&nbsp;     try {

&nbsp;       const result = await apiFunction(...args);

&nbsp;       setData(result);

&nbsp;       return result;

&nbsp;     } catch (err) {

&nbsp;       let errorMessage = 'An error occurred';

&nbsp;       

&nbsp;       if (err instanceof ApiException) {

&nbsp;         errorMessage = err.data.error;

&nbsp;         if (err.data.errors) {

&nbsp;           errorMessage += ': ' + err.data.errors.map(e => e.msg).join(', ');

&nbsp;         }

&nbsp;       } else if (err instanceof Error) {

&nbsp;         errorMessage = err.message;

&nbsp;       }

&nbsp;       

&nbsp;       setError(errorMessage);

&nbsp;       toast.error(errorMessage);

&nbsp;       throw err;

&nbsp;     } finally {

&nbsp;       setLoading(false);

&nbsp;     }

&nbsp;   },

&nbsp;   \[apiFunction]

&nbsp; );



&nbsp; return { data, loading, error, execute };

}

```



---



\## 🛠️ Step 4: Update App.tsx



Replace the current `App.tsx` with API integration:



\*\*File: `src/App.tsx` (Modified)\*\*



```typescript

import { useState, useMemo, useEffect } from 'react';

import { Button } from '@/components/ui/button';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Input } from '@/components/ui/input';

import { Separator } from '@/components/ui/separator';

import { 

&nbsp; Plus, 

&nbsp; Buildings, 

&nbsp; EnvelopeSimple,

&nbsp; PaperPlaneRight,

&nbsp; MagnifyingGlass

} from '@phosphor-icons/react';

import { TemplateCard } from '@/components/TemplateCard';

import { TemplateEditor } from '@/components/TemplateEditor';

import { TestEmailDialog } from '@/components/TestEmailDialog';

import { TemplatePreviewDialog } from '@/components/TemplatePreviewDialog';

import type { BaseTemplate, Corporate, CorporateTemplate } from '@/lib/types';

import { toast } from 'sonner';

import { Toaster } from '@/components/ui/sonner';



// Import API services

import \* as baseTemplatesApi from '@/services/baseTemplates';

import \* as corporateTemplatesApi from '@/services/corporateTemplates';

import \* as tenantsApi from '@/services/tenants';

import \* as emailsApi from '@/services/emails';



function App() {

&nbsp; // State

&nbsp; const \[baseTemplates, setBaseTemplates] = useState<BaseTemplate\[]>(\[]);

&nbsp; const \[corporateTemplates, setCorporateTemplates] = useState<CorporateTemplate\[]>(\[]);

&nbsp; const \[corporates, setCorporates] = useState<Corporate\[]>(\[]);

&nbsp; const \[loading, setLoading] = useState(true);

&nbsp; 

&nbsp; const \[selectedCorporateId, setSelectedCorporateId] = useState<string>('');

&nbsp; const \[searchQuery, setSearchQuery] = useState('');

&nbsp; const \[activeTab, setActiveTab] = useState('base');

&nbsp; 

&nbsp; const \[editorOpen, setEditorOpen] = useState(false);

&nbsp; const \[testEmailOpen, setTestEmailOpen] = useState(false);

&nbsp; const \[previewOpen, setPreviewOpen] = useState(false);

&nbsp; 

&nbsp; const \[editingTemplate, setEditingTemplate] = useState<BaseTemplate | CorporateTemplate | null>(null);

&nbsp; const \[previewingTemplate, setPreviewingTemplate] = useState<BaseTemplate | CorporateTemplate | null>(null);

&nbsp; const \[testingTemplate, setTestingTemplate] = useState<BaseTemplate | CorporateTemplate | null>(null);

&nbsp; const \[isEditingCorporateTemplate, setIsEditingCorporateTemplate] = useState(false);



&nbsp; // Load initial data

&nbsp; useEffect(() => {

&nbsp;   loadInitialData();

&nbsp; }, \[]);



&nbsp; // Load corporate templates when corporate is selected

&nbsp; useEffect(() => {

&nbsp;   if (selectedCorporateId) {

&nbsp;     loadCorporateTemplates(selectedCorporateId);

&nbsp;   }

&nbsp; }, \[selectedCorporateId]);



&nbsp; const loadInitialData = async () => {

&nbsp;   setLoading(true);

&nbsp;   try {

&nbsp;     const \[templatesData, corporatesData] = await Promise.all(\[

&nbsp;       baseTemplatesApi.getBaseTemplates(),

&nbsp;       tenantsApi.getTenants()

&nbsp;     ]);

&nbsp;     

&nbsp;     setBaseTemplates(templatesData);

&nbsp;     setCorporates(corporatesData);

&nbsp;   } catch (error) {

&nbsp;     toast.error('Failed to load data');

&nbsp;     console.error(error);

&nbsp;   } finally {

&nbsp;     setLoading(false);

&nbsp;   }

&nbsp; };



&nbsp; const loadCorporateTemplates = async (corporateId: string) => {

&nbsp;   try {

&nbsp;     const data = await corporateTemplatesApi.getCorporateTemplates({ corporateId });

&nbsp;     setCorporateTemplates(data);

&nbsp;   } catch (error) {

&nbsp;     toast.error('Failed to load corporate templates');

&nbsp;     console.error(error);

&nbsp;   }

&nbsp; };



&nbsp; const filteredBaseTemplates = useMemo(() => {

&nbsp;   if (!baseTemplates) return \[];

&nbsp;   return baseTemplates.filter(template => 

&nbsp;     template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||

&nbsp;     template.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||

&nbsp;     template.eventType.toLowerCase().includes(searchQuery.toLowerCase())

&nbsp;   );

&nbsp; }, \[baseTemplates, searchQuery]);



&nbsp; const filteredCorporateTemplates = useMemo(() => {

&nbsp;   if (!corporateTemplates) return \[];

&nbsp;   return corporateTemplates.filter(template => {

&nbsp;     const matchesSearch = 

&nbsp;       template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||

&nbsp;       template.subject.toLowerCase().includes(searchQuery.toLowerCase());

&nbsp;     

&nbsp;     const matchesCorporate = !selectedCorporateId || template.corporateId === selectedCorporateId;

&nbsp;     

&nbsp;     return matchesSearch \&\& matchesCorporate;

&nbsp;   });

&nbsp; }, \[corporateTemplates, searchQuery, selectedCorporateId]);



&nbsp; const handleCreateNewTemplate = () => {

&nbsp;   setEditingTemplate({

&nbsp;     id: '',

&nbsp;     name: '',

&nbsp;     subject: '',

&nbsp;     content: '',

&nbsp;     eventType: 'general',

&nbsp;     description: '',

&nbsp;     createdAt: new Date().toISOString(),

&nbsp;     updatedAt: new Date().toISOString(),

&nbsp;   } as BaseTemplate);

&nbsp;   setIsEditingCorporateTemplate(false);

&nbsp;   setEditorOpen(true);

&nbsp; };



&nbsp; const handleCustomizeTemplate = (template: BaseTemplate) => {

&nbsp;   if (!selectedCorporateId) {

&nbsp;     toast.error('Please select a corporate first');

&nbsp;     return;

&nbsp;   }



&nbsp;   const existingCustomization = corporateTemplates?.find(

&nbsp;     ct => ct.baseTemplateId === template.id \&\& ct.corporateId === selectedCorporateId

&nbsp;   );



&nbsp;   if (existingCustomization) {

&nbsp;     setEditingTemplate(existingCustomization);

&nbsp;   } else {

&nbsp;     setEditingTemplate({

&nbsp;       id: '',

&nbsp;       baseTemplateId: template.id,

&nbsp;       corporateId: selectedCorporateId,

&nbsp;       name: `${template.name} (Custom)`,

&nbsp;       subject: template.subject,

&nbsp;       content: template.content,

&nbsp;       createdAt: new Date().toISOString(),

&nbsp;       updatedAt: new Date().toISOString(),

&nbsp;     } as CorporateTemplate);

&nbsp;   }

&nbsp;   

&nbsp;   setIsEditingCorporateTemplate(true);

&nbsp;   setEditorOpen(true);

&nbsp; };



&nbsp; const handleEditCorporateTemplate = (template: CorporateTemplate) => {

&nbsp;   setEditingTemplate(template);

&nbsp;   setIsEditingCorporateTemplate(true);

&nbsp;   setEditorOpen(true);

&nbsp; };



&nbsp; const handleSaveTemplate = async (name: string, subject: string, content: string) => {

&nbsp;   if (!editingTemplate) return;



&nbsp;   try {

&nbsp;     if (isEditingCorporateTemplate) {

&nbsp;       const corporateTemplate = editingTemplate as CorporateTemplate;

&nbsp;       

&nbsp;       if (corporateTemplate.id) {

&nbsp;         // Update existing

&nbsp;         const updated = await corporateTemplatesApi.updateCorporateTemplate(

&nbsp;           corporateTemplate.id,

&nbsp;           { name, subject, content }

&nbsp;         );

&nbsp;         

&nbsp;         setCorporateTemplates(current => 

&nbsp;           current.map(t => t.id === updated.id ? updated : t)

&nbsp;         );

&nbsp;       } else {

&nbsp;         // Create new

&nbsp;         const created = await corporateTemplatesApi.createCorporateTemplate({

&nbsp;           baseTemplateId: corporateTemplate.baseTemplateId,

&nbsp;           corporateId: corporateTemplate.corporateId,

&nbsp;           name,

&nbsp;           subject,

&nbsp;           content

&nbsp;         });

&nbsp;         

&nbsp;         setCorporateTemplates(current => \[...current, created]);

&nbsp;       }



&nbsp;       toast.success('Corporate template saved successfully');

&nbsp;     } else {

&nbsp;       const baseTemplate = editingTemplate as BaseTemplate;

&nbsp;       

&nbsp;       if (baseTemplate.id) {

&nbsp;         // Update existing

&nbsp;         const updated = await baseTemplatesApi.updateBaseTemplate(

&nbsp;           baseTemplate.id,

&nbsp;           {

&nbsp;             name,

&nbsp;             subject,

&nbsp;             content,

&nbsp;             eventType: baseTemplate.eventType,

&nbsp;             description: baseTemplate.description

&nbsp;           }

&nbsp;         );

&nbsp;         

&nbsp;         setBaseTemplates(current => 

&nbsp;           current.map(t => t.id === updated.id ? updated : t)

&nbsp;         );

&nbsp;       } else {

&nbsp;         // Create new

&nbsp;         const created = await baseTemplatesApi.createBaseTemplate({

&nbsp;           name,

&nbsp;           subject,

&nbsp;           content,

&nbsp;           eventType: baseTemplate.eventType,

&nbsp;           description: baseTemplate.description

&nbsp;         });

&nbsp;         

&nbsp;         setBaseTemplates(current => \[...current, created]);

&nbsp;       }



&nbsp;       toast.success('Base template saved successfully');

&nbsp;     }



&nbsp;     setEditorOpen(false);

&nbsp;     setEditingTemplate(null);

&nbsp;   } catch (error) {

&nbsp;     console.error('Failed to save template:', error);

&nbsp;   }

&nbsp; };



&nbsp; const handlePreview = (template: BaseTemplate | CorporateTemplate) => {

&nbsp;   setPreviewingTemplate(template);

&nbsp;   setPreviewOpen(true);

&nbsp; };



&nbsp; const handleSendTestEmail = (template: BaseTemplate | CorporateTemplate) => {

&nbsp;   setTestingTemplate(template);

&nbsp;   setTestEmailOpen(true);

&nbsp; };



&nbsp; const handleTestEmailSend = async (email: string, attachments: File\[]) => {

&nbsp;   if (!testingTemplate) return;

&nbsp;   

&nbsp;   try {

&nbsp;     await emailsApi.sendTestEmail({

&nbsp;       recipientEmail: email,

&nbsp;       subject: testingTemplate.subject,

&nbsp;       content: testingTemplate.content,

&nbsp;       templateId: testingTemplate.id,

&nbsp;       corporateId: selectedCorporateId,

&nbsp;       attachments

&nbsp;     });

&nbsp;     

&nbsp;     toast.success(`Test email sent to ${email}`, {

&nbsp;       description: attachments.length > 0 

&nbsp;         ? `With ${attachments.length} attachment(s)` 

&nbsp;         : undefined

&nbsp;     });

&nbsp;   } catch (error) {

&nbsp;     console.error('Failed to send test email:', error);

&nbsp;   }

&nbsp; };



&nbsp; const handleDuplicateTemplate = async (template: BaseTemplate) => {

&nbsp;   try {

&nbsp;     const duplicated = await baseTemplatesApi.createBaseTemplate({

&nbsp;       name: `${template.name} (Copy)`,

&nbsp;       subject: template.subject,

&nbsp;       content: template.content,

&nbsp;       eventType: template.eventType,

&nbsp;       description: template.description

&nbsp;     });



&nbsp;     setBaseTemplates(current => \[...current, duplicated]);

&nbsp;     toast.success('Template duplicated successfully');

&nbsp;   } catch (error) {

&nbsp;     console.error('Failed to duplicate template:', error);

&nbsp;   }

&nbsp; };



&nbsp; const handleDeleteCorporateTemplate = async (templateId: string) => {

&nbsp;   if (window.confirm('Are you sure you want to delete this customized template?')) {

&nbsp;     try {

&nbsp;       await corporateTemplatesApi.deleteCorporateTemplate(templateId);

&nbsp;       setCorporateTemplates(current => current.filter(t => t.id !== templateId));

&nbsp;       toast.success('Template deleted successfully');

&nbsp;     } catch (error) {

&nbsp;       console.error('Failed to delete template:', error);

&nbsp;     }

&nbsp;   }

&nbsp; };



&nbsp; if (loading) {

&nbsp;   return (

&nbsp;     <div className="min-h-screen bg-background flex items-center justify-center">

&nbsp;       <div className="text-center">

&nbsp;         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>

&nbsp;         <p className="text-muted-foreground">Loading templates...</p>

&nbsp;       </div>

&nbsp;     </div>

&nbsp;   );

&nbsp; }



&nbsp; return (

&nbsp;   <div className="min-h-screen bg-background">

&nbsp;     <Toaster />

&nbsp;     

&nbsp;     {/\* Rest of the JSX remains the same as the original App.tsx \*/}

&nbsp;     {/\* ... header, main content, etc. ... \*/}

&nbsp;     

&nbsp;   </div>

&nbsp; );

}



export default App;

```



---



\## 🛠️ Step 5: Environment Configuration



\*\*File: `.env`\*\*



```env

VITE\_API\_BASE\_URL=http://localhost:3000/api

```



\*\*File: `.env.production`\*\*



```env

VITE\_API\_BASE\_URL=https://your-api-domain.com/api

```



---



\## 🛠️ Step 6: Update package.json Scripts



```json

{

&nbsp; "scripts": {

&nbsp;   "dev": "vite",

&nbsp;   "build": "vite build",

&nbsp;   "preview": "vite preview",

&nbsp;   "type-check": "tsc --noEmit"

&nbsp; }

}

```



---



\## ✅ Migration Checklist



\- \[ ] Create all service files (`api.ts`, `baseTemplates.ts`, etc.)

\- \[ ] Create `useApi` custom hook

\- \[ ] Update `App.tsx` to use API calls instead of `useKV`

\- \[ ] Add `.env` file with API URL

\- \[ ] Test all CRUD operations

\- \[ ] Add loading states

\- \[ ] Add error handling

\- \[ ] Test email sending with attachments

\- \[ ] Update TypeScript types if needed

\- \[ ] Test with backend API running



---



\## 🧪 Testing



```typescript

// Test in browser console

fetch('http://localhost:3000/api/tenants')

&nbsp; .then(r => r.json())

&nbsp; .then(console.log)



fetch('http://localhost:3000/api/base-templates')

&nbsp; .then(r => r.json())

&nbsp; .then(console.log)

```



---



\## 🔒 CORS Configuration



Make sure your backend allows requests from the frontend origin:



```javascript

// In your Express app

app.use(cors({

&nbsp; origin: 'http://localhost:5173', // Your Vite dev server

&nbsp; credentials: true

}));

```



---



\## 📝 Summary of Changes



1\. \*\*Removed\*\*: `useKV` hooks from `@github/spark/hooks`

2\. \*\*Added\*\*: API service functions for all operations

3\. \*\*Added\*\*: `useApi` custom hook for API calls with loading/error states

4\. \*\*Updated\*\*: `App.tsx` to use `useState` + `useEffect` + API calls

5\. \*\*Added\*\*: Environment variable configuration

6\. \*\*Added\*\*: Loading and error states throughout the app



---



This completes the frontend integration! Your app will now communicate with your backend API instead of using local storage.



