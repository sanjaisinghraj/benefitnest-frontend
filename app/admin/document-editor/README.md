# AI Document Editor Module

## Overview

The AI Document Editor is a powerful document processing tool that allows administrators to:
- Upload documents (PDF, images, text files)
- Extract text using OCR and PDF parsing
- Edit content in a rich text editor
- Use AI to analyze, summarize, and improve documents
- Export documents in multiple formats

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                        │
│                    app/admin/document-editor/page.tsx                        │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Upload     │  │   Editor     │  │ AI Assistant │  │   Export     │    │
│  │   Zone       │  │   Area       │  │   Panel      │  │   Options    │    │
│  └──────┬───────┘  └──────────────┘  └──────┬───────┘  └──────────────┘    │
│         │                                    │                               │
└─────────┼────────────────────────────────────┼───────────────────────────────┘
          │                                    │
          │ POST /api/admin/document/parse     │ POST /api/admin/document/ai-assist
          │ (FREE - Local Processing)          │ (GROQ API - User Triggered)
          │                                    │
┌─────────┼────────────────────────────────────┼───────────────────────────────┐
│         ▼                                    ▼                               │
│                              BACKEND                                         │
│                    routes/document.routes.js                                 │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        /parse Endpoint                                │  │
│  │                        (FREE - No API Costs)                          │  │
│  │                                                                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │  │
│  │  │  pdf-parse  │  │ Tesseract.js│  │   Direct    │  │ Placeholder │ │  │
│  │  │   (PDFs)    │  │  (Images)   │  │   Decode    │  │ (Word/Excel)│ │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                     /ai-assist Endpoint                               │  │
│  │                     (GROQ API - Rate Limited)                         │  │
│  │                                                                       │  │
│  │                    ┌─────────────────────┐                            │  │
│  │                    │  Groq AI (LLaMA)    │                            │  │
│  │                    │  llama-3.3-70b      │                            │  │
│  │                    └─────────────────────┘                            │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Processing Flow

### 1. Document Upload Flow

```
User uploads file
        │
        ▼
┌───────────────────┐
│ Validate file     │
│ (type, size)      │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Convert to Base64 │
│ (FileReader API)  │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Send to Backend   │
│ POST /parse       │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Detect file type  │
└─────────┬─────────┘
          │
    ┌─────┴─────┬─────────────┬─────────────┐
    ▼           ▼             ▼             ▼
┌───────┐  ┌─────────┐  ┌──────────┐  ┌──────────┐
│  PDF  │  │  Image  │  │   Text   │  │  Other   │
└───┬───┘  └────┬────┘  └────┬─────┘  └────┬─────┘
    │           │            │             │
    ▼           ▼            ▼             ▼
┌─────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐
│pdf-parse│ │Tesseract │ │ Direct   │ │Placeholder│
│  (npm)  │ │   OCR    │ │ Decode   │ │  Message  │
└────┬────┘ └────┬─────┘ └────┬─────┘ └─────┬─────┘
     │           │            │             │
     └───────────┴────────────┴─────────────┘
                      │
                      ▼
          ┌───────────────────┐
          │ Return extracted  │
          │ text + metadata   │
          └─────────┬─────────┘
                    │
                    ▼
          ┌───────────────────┐
          │ Display in editor │
          │ Show success msg  │
          └───────────────────┘
```

### 2. AI Assistant Flow (User-Triggered)

```
User enters prompt OR clicks quick action
        │
        ▼
┌───────────────────────────────┐
│ Quick Actions:                │
│ • Summarize                   │
│ • Extract Key Points          │
│ • Fix Grammar & Spelling      │
│ • Simplify Language           │
│ • Format as Table             │
│ • Translate                   │
│ • Custom Prompt               │
└─────────────┬─────────────────┘
              │
              ▼
┌───────────────────────────────┐
│ POST /api/admin/document/     │
│       ai-assist               │
│                               │
│ Body:                         │
│ {                             │
│   prompt: "...",              │
│   currentContent: "...",      │
│   fileName: "..."             │
│ }                             │
└─────────────┬─────────────────┘
              │
              ▼
┌───────────────────────────────┐
│ Groq API Call                 │
│ Model: llama-3.3-70b-versatile│
│ Max Tokens: 8000              │
└─────────────┬─────────────────┘
              │
              ▼
┌───────────────────────────────┐
│ Return processed content      │
│ Update editor                 │
│ Show success notification     │
└───────────────────────────────┘
```

---

## File Processing Details

### PDF Processing (pdf-parse)

| Feature | Details |
|---------|---------|
| **Library** | `pdf-parse` (npm package) |
| **Cost** | FREE (local processing) |
| **Capabilities** | Extract text from digital PDFs |
| **Limitations** | Cannot extract from scanned/image PDFs |
| **Output** | Raw text + page count + metadata |

```javascript
// How it works internally
const pdfParse = require('pdf-parse');
const pdfBuffer = Buffer.from(base64Content, 'base64');
const data = await pdfParse(pdfBuffer);
// data.text = extracted text
// data.numpages = number of pages
// data.info = PDF metadata
```

### Image OCR (Tesseract.js)

| Feature | Details |
|---------|---------|
| **Library** | `tesseract.js` v5 |
| **Cost** | FREE (local processing) |
| **Languages** | 100+ languages (default: English) |
| **Capabilities** | Extract printed text from images |
| **Limitations** | Limited handwriting support |
| **Output** | Text + confidence score (%) |

```javascript
// How it works internally
const Tesseract = require('tesseract.js');
const result = await Tesseract.recognize(
    imageDataUrl,
    'eng', // language
    { logger: m => console.log(m) }
);
// result.data.text = extracted text
// result.data.confidence = accuracy %
```

### Text Files (Direct Decode)

| File Types | Processing |
|------------|------------|
| `.txt` | UTF-8 decode |
| `.csv` | UTF-8 decode |
| `.json` | UTF-8 decode |
| `.md` | UTF-8 decode |
| `.html` | UTF-8 decode |

```javascript
// How it works
const decoded = Buffer.from(fileContent, 'base64').toString('utf-8');
```

---

## AI Assistant Capabilities

### Quick Actions

| Action | Prompt Sent to AI |
|--------|-------------------|
| **Summarize** | "Please summarize this document concisely, highlighting the main points." |
| **Extract Key Points** | "Extract the key points and important information from this document as a bullet list." |
| **Fix Grammar** | "Fix all grammar, spelling, and punctuation errors while preserving the meaning." |
| **Simplify Language** | "Rewrite this document using simpler, clearer language while keeping the same meaning." |
| **Format as Table** | "Convert the relevant data in this document into a well-formatted markdown table." |
| **Translate** | "Translate this document to [language]." |

### Custom Prompts

Users can enter any custom instruction such as:
- "Convert this to a formal business letter"
- "Add section headers and organize the content"
- "Extract all dates and amounts mentioned"
- "Rewrite in third person"
- "Create an executive summary"

---

## API Endpoints

### POST /api/admin/document/parse

**Purpose:** Extract text from uploaded documents (FREE, local processing)

**Request:**
```json
{
  "fileName": "policy.pdf",
  "fileType": "application/pdf",
  "fileContent": "base64-encoded-content",
  "fileSize": 1024000
}
```

**Response:**
```json
{
  "success": true,
  "content": "Extracted text content...",
  "type": "pdf-extract",
  "engine": "pdf-parse",
  "numPages": 5,
  "note": "Extracted text from 5 page(s). Use AI Assistant to format."
}
```

**Response Types:**

| Type | Engine | Description |
|------|--------|-------------|
| `direct` | Direct Decode | Text files decoded directly |
| `pdf-extract` | pdf-parse | Text extracted from PDF |
| `pdf-scanned` | pdf-parse | PDF is image-based, no text layer |
| `ocr-tesseract` | Tesseract.js | Text extracted via OCR |
| `ocr-failed` | Tesseract.js | OCR could not extract text |
| `word-placeholder` | None | Word document (manual paste) |
| `spreadsheet-placeholder` | None | Excel file (export as CSV) |
| `unsupported` | None | Unknown file type |

---

### POST /api/admin/document/ai-assist

**Purpose:** Process document content with AI (GROQ API)

**Request:**
```json
{
  "prompt": "Summarize this document",
  "currentContent": "Document text content...",
  "fileName": "policy.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "content": "AI processed content...",
  "prompt": "Summarize this document",
  "engine": "Groq AI (llama-3.3-70b)"
}
```

---

### POST /api/admin/document/generate

**Purpose:** Generate new documents from scratch (GROQ API)

**Request:**
```json
{
  "documentType": "Policy Document",
  "topic": "Group Health Insurance Terms",
  "details": "Include coverage, exclusions, claim process"
}
```

**Response:**
```json
{
  "success": true,
  "content": "Generated document content...",
  "documentType": "Policy Document",
  "topic": "Group Health Insurance Terms",
  "engine": "Groq AI (llama-3.3-70b)"
}
```

---

## Export Options

| Format | Description | MIME Type |
|--------|-------------|-----------|
| **TXT** | Plain text file | text/plain |
| **MD** | Markdown format | text/markdown |
| **HTML** | HTML document | text/html |

---

## UI Components

### 1. Upload Zone
- Drag & drop support
- Click to browse
- File type validation
- Size limit display (10MB)
- Preview for images

### 2. Editor Area
- Large textarea for editing
- Word count & character count
- Undo/Redo functionality
- Text formatting toolbar
- Real-time editing

### 3. Toolbar Actions
| Button | Action |
|--------|--------|
| **Bold** | Wrap selected text in `**` |
| **Italic** | Wrap selected text in `*` |
| **H1** | Add `# ` prefix |
| **H2** | Add `## ` prefix |
| **Bullet List** | Add `- ` prefix |
| **Numbered List** | Add `1. ` prefix |
| **Undo** | Restore previous content |
| **Redo** | Restore next content |
| **Clear** | Clear all content |

### 4. AI Assistant Panel
- Quick action buttons
- Custom prompt input
- Processing indicator
- History tracking

### 5. Export Panel
- Format selection (TXT/MD/HTML)
- Download button
- Copy to clipboard

---

## Environment Variables

```env
# Required for AI Assistant features
GROQ_API_KEY=gsk_xxxxxxxxxxxxx

# Alternative key name
AI_API_KEY=gsk_xxxxxxxxxxxxx
```

---

## Dependencies

### Backend (package.json)
```json
{
  "pdf-parse": "^1.1.4",
  "tesseract.js": "^5.1.1",
  "axios": "^1.13.2"
}
```

### Frontend
- React 18+
- Next.js 14+
- Standard fetch API

---

## File Structure

```
frontend/
└── app/
    └── admin/
        └── document-editor/
            ├── page.tsx       # Main component
            └── README.md      # This documentation

backend/
└── routes/
    └── document.routes.js     # API endpoints
```

---

## Security Considerations

1. **Authentication**: All endpoints require admin authentication (`authMiddleware`)
2. **File Size Limit**: 10MB maximum upload size
3. **File Type Validation**: Only allowed types are processed
4. **API Key Protection**: Groq API key stored in environment variables
5. **Rate Limiting**: Groq API has built-in rate limits

---

## Error Handling

| Error | Handling |
|-------|----------|
| No API key | Returns helpful message, local processing still works |
| File too large | Frontend validation prevents upload |
| Invalid file type | Shows supported formats |
| OCR failure | Falls back to placeholder with instructions |
| API timeout | 60-second timeout with error message |
| Network error | Graceful fallback to manual editing |

---

## Performance Considerations

| Operation | Typical Time | Notes |
|-----------|--------------|-------|
| PDF parse | 1-3 seconds | Depends on page count |
| Image OCR | 3-10 seconds | Depends on image size/quality |
| Text decode | < 100ms | Instant |
| AI processing | 2-5 seconds | Depends on content length |

---

## Usage Examples

### Example 1: Upload Insurance Policy PDF
1. Drag PDF to upload zone
2. Text extracted automatically (pdf-parse)
3. Click "Extract Key Points" 
4. AI creates bullet list of key terms
5. Export as Markdown

### Example 2: OCR a Scanned Document
1. Upload JPG/PNG image
2. Tesseract.js extracts text (may take 5-10 seconds)
3. Review extracted text, fix any OCR errors
4. Click "Fix Grammar" to clean up
5. Export as TXT

### Example 3: Create New Document
1. Click "Generate with AI"
2. Select document type
3. Enter topic and requirements
4. AI generates complete document
5. Edit and customize
6. Export in desired format

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| PDF shows "scanned" | The PDF is image-based. Take screenshots and upload as images for OCR. |
| OCR quality is poor | Use higher resolution images. Ensure text is clear and not rotated. |
| AI Assistant not working | Check that GROQ_API_KEY is set in environment variables. |
| Upload fails | Check file size (max 10MB) and file type. |
| Slow OCR | Tesseract processes locally - larger images take longer. |

---

## Future Enhancements

- [ ] Word document (.docx) native parsing
- [ ] Excel spreadsheet parsing
- [ ] Multi-language OCR support
- [ ] Batch document processing
- [ ] Document comparison
- [ ] Version history
- [ ] Cloud storage integration
- [ ] PDF generation/export

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial release with PDF, Image, Text support |
| 1.1 | Jan 2026 | Added Tesseract.js fallback, removed Groq from parse endpoint |
| 1.2 | Jan 2026 | Added pdf-parse for free PDF text extraction |

---

## License

Internal use only - Part of BenefitNest Insurance Platform
