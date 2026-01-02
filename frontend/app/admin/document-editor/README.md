# AI Document Editor Module

## Overview

The AI Document Editor is a powerful document processing tool that allows administrators to:
- Upload documents (PDF, images, text files) up to **50MB**
- Extract text using OCR and PDF parsing (FREE local processing)
- Edit content in a **split-view interface** with original document on left and AI analysis on right
- Use AI to analyze, summarize, extract key points, and improve documents
- View AI responses with **rich formatting** (headings, bullets, bold, italic)
- Edit AI responses with **View/Edit mode toggle** and formatting toolbar
- Export documents in multiple formats including **Word (.doc)** and **Excel (.xls)**

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                            │
│                    app/admin/document-editor/page.tsx                            │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                         SPLIT-VIEW LAYOUT                                    ││
│  │  ┌──────────────────────────┐  ┌──────────────────────────────────────────┐ ││
│  │  │    LEFT PANEL (40%)      │  │         RIGHT PANEL (60%)                 │ ││
│  │  │                          │  │                                           │ ││
│  │  │  ┌────────────────────┐  │  │  ┌─────────────────────────────────────┐ │ ││
│  │  │  │  Original Document │  │  │  │  AI Analysis Tabs                   │ │ ││
│  │  │  │  (Editable)        │  │  │  │  • Summarize    • Key Points        │ │ ││
│  │  │  │                    │  │  │  │  • Grammar      • Simplify          │ │ ││
│  │  │  │  [EDITED] indicator│  │  │  │  • Format Table • Translate         │ │ ││
│  │  │  │  [Reset] button    │  │  │  └─────────────────────────────────────┘ │ ││
│  │  │  └────────────────────┘  │  │                                           │ ││
│  │  │                          │  │  ┌─────────────────────────────────────┐ │ ││
│  │  │  File Info:              │  │  │  Formatting Toolbar                 │ │ ││
│  │  │  • Name, Size            │  │  │  [View] [Edit] | B I U H | [EDITED] │ │ ││
│  │  │  • Extraction Engine     │  │  └─────────────────────────────────────┘ │ ││
│  │  │                          │  │                                           │ ││
│  │  └──────────────────────────┘  │  ┌─────────────────────────────────────┐ │ ││
│  │                                 │  │  AI Response (Formatted HTML)      │ │ ││
│  │                                 │  │  OR Raw Markdown Editor            │ │ ││
│  │                                 │  └─────────────────────────────────────┘ │ ││
│  │                                 │                                           │ ││
│  │                                 │  ┌─────────────────────────────────────┐ │ ││
│  │                                 │  │  Export: TXT MD HTML 📄Word 📊Excel│ │ ││
│  │                                 │  └─────────────────────────────────────┘ │ ││
│  │                                 └──────────────────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
          │                                    │
          │ POST /api/admin/document/parse     │ POST /api/admin/document/ai-assist
          │ (FREE - Local Processing)          │ (GROQ API - User Triggered)
          │                                    │
┌─────────┼────────────────────────────────────┼───────────────────────────────────┐
│         ▼                                    ▼                                   │
│                              BACKEND                                             │
│                    routes/document.routes.js                                     │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │                        /parse Endpoint                                      │ │
│  │                        (FREE - No API Costs)                                │ │
│  │                                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │ │
│  │  │  pdf-parse  │  │  pdfjs-dist │  │  pdf2json   │  │ Tesseract.js│       │ │
│  │  │  (Primary)  │  │  (Fallback) │  │  (Fallback) │  │  (Images)   │       │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘       │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │                     /ai-assist Endpoint                                     │ │
│  │                     (GROQ API - Rate Limited)                               │ │
│  │                                                                             │ │
│  │                    ┌─────────────────────────┐                              │ │
│  │                    │  Groq AI (LLaMA)        │                              │ │
│  │                    │  llama-3.3-70b-versatile│                              │ │
│  │                    └─────────────────────────┘                              │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
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

| Format | Description | MIME Type | File Extension |
|--------|-------------|-----------|----------------|
| **TXT** | Plain text file | text/plain | .txt |
| **MD** | Markdown format | text/markdown | .md |
| **HTML** | Styled HTML document with CSS | text/html | .html |
| **📄 Word** | Microsoft Word compatible (via HTML) | application/msword | .doc |
| **📊 Excel** | Excel-compatible spreadsheet (for tabular data) | application/vnd.ms-excel | .xls |

### Excel Export Detection

Excel export button appears automatically when AI response contains tabular data:
- Markdown tables (`|` separators with `---` rows)
- CSV-like data (multiple lines with commas or tabs)
- Key:Value pairs (3+ lines with colon separators)

---

## UI Components

### 1. Upload Zone
- Drag & drop support with visual feedback
- Click to browse files
- File type validation (PDF, images, text files)
- Size limit: **50MB** (increased from 10MB)
- Image preview for uploaded images

### 2. Split-View Layout

The interface is divided into two panels:

| Panel | Width | Contents |
|-------|-------|----------|
| **Left Panel** | 40% | Original Document (editable) |
| **Right Panel** | 60% | AI Analysis Tabs |

### 3. Original Document Panel (Left)
- **Editable textarea** for the extracted content
- **"EDITED" indicator** when content is modified
- **Reset button** to restore original extracted text
- File metadata (name, size, extraction engine)
- Character and word count

### 4. AI Analysis Panel (Right)

#### AI Tabs
| Tab | Icon | Purpose |
|-----|------|---------|
| **Summary** | 📝 | Generate document summary |
| **Key Points** | 🎯 | Extract bullet-point key information |
| **Grammar** | ✍️ | Fix grammar, spelling, punctuation |
| **Simplify** | 💡 | Rewrite in simpler language |
| **Table** | 📊 | Convert data to markdown table |
| **Translate** | 🌐 | Translate to other languages |

#### View/Edit Mode Toggle
| Mode | Description |
|------|-------------|
| **👁 View** | Displays AI response as formatted HTML (headings, bullets, bold) |
| **✎ Edit** | Raw Markdown editor for direct editing |

#### Formatting Toolbar (View Mode)
| Button | Action | Markdown |
|--------|--------|----------|
| **B** | Bold selected text | `**text**` |
| **I** | Italicize selected text | `*text*` |
| **U** | Underline selected text | `__text__` |
| **H** | Make heading | `## text` |

#### Edit Indicator
- Shows **"✎ EDITED"** badge when AI response has been modified
- Persists per tab

### 5. Export Footer
| Button | Format | Description |
|--------|--------|-------------|
| **↺ Regenerate** | - | Re-run AI analysis |
| **📋 Copy** | - | Copy to clipboard |
| **TXT** | .txt | Plain text export |
| **MD** | .md | Markdown format |
| **HTML** | .html | Styled HTML document |
| **📄 Word** | .doc | Microsoft Word compatible |
| **📊 Excel** | .xls | Excel (only shows for tabular data) |

---

## Markdown to HTML Formatting

AI responses are automatically converted to styled HTML:

| Markdown | HTML Output |
|----------|-------------|
| `# Heading 1` | `<h1>` with 22px font, bold |
| `## Heading 2` | `<h2>` with 18px font, border-bottom |
| `### Heading 3` | `<h3>` with 16px font |
| `**bold**` | `<strong>` |
| `*italic*` | `<em>` |
| `- bullet` | `<ul><li>` with proper indentation |
| `1. numbered` | `<li>` styled list item |
| Double newline | New `<p>` paragraph |

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
  "pdfjs-dist": "^4.0.0",
  "pdf2json": "^3.1.4",
  "tesseract.js": "^5.1.1",
  "axios": "^1.13.2"
}
```

### Frontend
- React 19+
- Next.js 16+
- Standard fetch API

---

## Server Configuration

### Body Parser Limits (backend/index.js)
```javascript
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
```

This allows uploading documents up to **50MB** in size.

---

## File Structure

```
frontend/
└── app/
    └── admin/
        └── document-editor/
            ├── page.tsx       # Main component (~1100 lines)
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
| PayloadTooLargeError | Backend limit increased to 50MB - redeploy if needed |

---

## Performance Considerations

| Operation | Typical Time | Notes |
|-----------|--------------|-------|
| PDF parse | 1-3 seconds | Depends on page count |
| Image OCR | 3-10 seconds | Depends on image size/quality |
| Text decode | < 100ms | Instant |
| AI processing | 2-5 seconds | Depends on content length |
| Markdown→HTML | < 50ms | Client-side rendering |
| Word export | < 100ms | HTML-based conversion |
| Excel export | < 100ms | Tab-separated format |

---

## Usage Examples

### Example 1: Upload Insurance Policy PDF
1. Drag PDF to upload zone
2. Text extracted automatically (pdf-parse) - appears in left panel
3. Click "Key Points" tab on right panel
4. Click "✨ Process with AI" button
5. AI creates formatted bullet list with headings
6. Toggle to "Edit" mode to refine if needed
7. Export as Word document

### Example 2: OCR a Scanned Document
1. Upload JPG/PNG image
2. Tesseract.js extracts text (may take 5-10 seconds)
3. Review and edit extracted text in left panel (shows "EDITED" indicator)
4. Click "Grammar" tab, then "Process with AI"
5. View formatted response with corrections highlighted
6. Export as TXT or HTML

### Example 3: Extract Data as Excel
1. Upload document with tabular data
2. Click "Table" tab
3. Process with AI - formats data into markdown table
4. Notice the 📊 Excel button appears automatically
5. Click to download as .xls file

### Example 4: Edit AI Response
1. Generate any AI analysis
2. Click "✎ Edit" toggle in toolbar
3. Modify the raw Markdown directly
4. Switch back to "👁 View" to see formatted result
5. "EDITED" badge appears in toolbar
6. Export preserves your edits

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| PDF shows "scanned" | The PDF is image-based. Take screenshots and upload as images for OCR. |
| OCR quality is poor | Use higher resolution images. Ensure text is clear and not rotated. |
| AI Assistant not working | Check that GROQ_API_KEY is set in environment variables. |
| Upload fails | Check file size (max 50MB) and file type. |
| Slow OCR | Tesseract processes locally - larger images take longer. |
| PayloadTooLargeError | Ensure backend has `express.json({ limit: '50mb' })` configured. |
| Excel button not showing | Excel export only appears when content contains tabular data patterns. |
| Formatting not applying | Select text first, then click B/I/U/H button. |

---

## Future Enhancements

- [ ] Word document (.docx) native parsing (mammoth.js)
- [ ] Excel spreadsheet parsing (xlsx)
- [ ] Multi-language OCR support (Tesseract language packs)
- [ ] Batch document processing
- [ ] Document comparison (diff view)
- [ ] Version history with undo stack
- [ ] Cloud storage integration (S3, GCS)
- [ ] PDF generation/export (jsPDF)
- [ ] Real-time collaboration
- [ ] Document templates library

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial release with PDF, Image, Text support |
| 1.1 | Jan 2026 | Added Tesseract.js fallback, removed Groq from parse endpoint |
| 1.2 | Jan 2026 | Added pdf-parse for free PDF text extraction |
| 1.3 | Jan 2026 | Split-view UI: original document (left) + AI tabs (right) |
| 1.4 | Jan 2026 | Editable original document with EDITED indicator |
| 1.5 | Jan 2026 | Increased body-parser limit to 50MB (fix PayloadTooLargeError) |
| **1.6** | **Jan 2026** | **Formatted AI responses (Markdown→HTML), View/Edit toggle, formatting toolbar (B/I/U/H), Word & Excel export** |

---

## License

Internal use only - Part of BenefitNest Insurance Platform
