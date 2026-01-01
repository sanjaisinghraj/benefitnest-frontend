"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import AdminTopBar from "../components/AdminTopBar";
import AdminFooter from "../components/AdminFooter";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://benefitnest-backend.onrender.com";

// Color palette
const colors = {
  primary: "#6366f1",
  primaryLight: "#eef2ff",
  secondary: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
};

// Supported file types
const SUPPORTED_TYPES = {
  "application/pdf": { ext: "PDF", icon: "📄" },
  "application/msword": { ext: "DOC", icon: "📝" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { ext: "DOCX", icon: "📝" },
  "text/plain": { ext: "TXT", icon: "📃" },
  "text/csv": { ext: "CSV", icon: "📊" },
  "image/png": { ext: "PNG", icon: "🖼️" },
  "image/jpeg": { ext: "JPEG", icon: "🖼️" },
  "image/jpg": { ext: "JPG", icon: "🖼️" },
};

// AI Analysis Tabs Configuration
const AI_TABS = [
  { id: "summary", label: "Summarize", icon: "📋", prompt: "Please provide a comprehensive summary of this document, highlighting the main topics, key points, and overall purpose." },
  { id: "keypoints", label: "Key Points", icon: "🔑", prompt: "Extract all the key points and important information from this document. Present them as a clear, organized bullet list." },
  { id: "grammar", label: "Fix Grammar", icon: "✏️", prompt: "Fix all grammar, spelling, and punctuation errors in this document. Return the corrected version while preserving the original meaning and structure." },
  { id: "bullets", label: "Bullet Points", icon: "📌", prompt: "Convert the content of this document into well-organized bullet points. Group related items together under appropriate headings." },
  { id: "professional", label: "Professional", icon: "💼", prompt: "Rewrite this document in a more professional and formal tone suitable for business communication. Improve clarity and structure." },
  { id: "simplified", label: "Simplify", icon: "🎯", prompt: "Simplify this document using plain, easy-to-understand language. Remove jargon and complex terms while keeping the essential information." },
];

// Helper functions
const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  return { Authorization: `Bearer ${token}` };
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Simple Markdown to HTML converter
const markdownToHtml = (md: string): string => {
  if (!md) return "";
  let html = md
    // Escape HTML
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Headers
    .replace(/^### (.+)$/gm, '<h3 style="color:#374151;margin:16px 0 8px 0;font-size:16px;">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color:#1f2937;margin:20px 0 10px 0;font-size:18px;border-bottom:1px solid #e5e7eb;padding-bottom:6px;">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="color:#111827;margin:24px 0 12px 0;font-size:22px;font-weight:700;">$1</h1>')
    // Bold and Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Bullet lists
    .replace(/^\* (.+)$/gm, '<li style="margin:4px 0;">$1</li>')
    .replace(/^- (.+)$/gm, '<li style="margin:4px 0;">$1</li>')
    .replace(/^• (.+)$/gm, '<li style="margin:4px 0;">$1</li>')
    // Numbered lists
    .replace(/^\d+\. (.+)$/gm, '<li style="margin:4px 0;">$1</li>')
    // Paragraphs (double newlines)
    .replace(/\n\n/g, '</p><p style="margin:12px 0;">')
    // Single newlines to <br>
    .replace(/\n/g, '<br>');
  
  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li[^>]*>.*?<\/li>)(?=\s*<li)/g, '$1');
  html = html.replace(/(<li[^>]*>.*?<\/li>)+/g, '<ul style="margin:12px 0;padding-left:24px;">$&</ul>');
  
  return `<div style="font-family:system-ui,-apple-system,sans-serif;line-height:1.7;color:#374151;"><p style="margin:12px 0;">${html}</p></div>`;
};

// Check if content has tabular data (for Excel export)
const hasTabularData = (content: string): boolean => {
  // Check for table-like patterns: multiple lines with consistent separators
  const lines = content.split('\n').filter(l => l.trim());
  if (lines.length < 2) return false;
  
  // Check for markdown tables
  if (content.includes('|') && lines.some(l => l.includes('---'))) return true;
  
  // Check for CSV-like data (multiple lines with commas or tabs)
  const commaLines = lines.filter(l => l.includes(',') || l.includes('\t'));
  if (commaLines.length >= 3) return true;
  
  // Check for colon-separated key-value pairs
  const colonLines = lines.filter(l => /^[^:]+:\s*.+/.test(l));
  if (colonLines.length >= 3) return true;
  
  return false;
};

// Toast Component
const Toast = ({ message, type, onClose }: { message: string; type: "success" | "error" | "info"; onClose: () => void }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = { success: "#10b981", error: "#ef4444", info: "#3b82f6" };

  return (
    <div style={{
      position: "fixed", bottom: "24px", right: "24px", backgroundColor: bgColors[type],
      color: "white", padding: "14px 20px", borderRadius: "10px",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)", zIndex: 1001,
      display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: 500, maxWidth: "400px",
    }}>
      {type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"} {message}
    </div>
  );
};

// Main Component
export default function DocumentEditorPage() {
  // State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [originalContent, setOriginalContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [extractionEngine, setExtractionEngine] = useState("");
  
  // AI Analysis State
  const [activeTab, setActiveTab] = useState("summary");
  const [aiResponses, setAiResponses] = useState<Record<string, string>>({});
  const [loadingTabs, setLoadingTabs] = useState<Record<string, boolean>>({});
  const [processedTabs, setProcessedTabs] = useState<Record<string, boolean>>({});
  const [editedAiResponses, setEditedAiResponses] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<"formatted" | "edit">("formatted");
  const aiResponseRef = useRef<HTMLDivElement>(null);
  
  // Track if original document was edited
  const [isDocumentEdited, setIsDocumentEdited] = useState(false);

  // Corporate Assignment State
  const [showCorporatePanel, setShowCorporatePanel] = useState(false);
  const [tenantsList, setTenantsList] = useState<Array<{id: string; tenant_code: string; corporate_legal_name: string; status: string}>>([]);
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [assignedCorporates, setAssignedCorporates] = useState<Array<{tenant_id: string; tenant_code: string; tenant?: {corporate_legal_name: string}; assigned_at: string; enabled_for_employees: boolean}>>([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [enableForEmployees, setEnableForEmployees] = useState(false);
  const [searchTenant, setSearchTenant] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  };

  // Fetch tenants list when panel opens
  useEffect(() => {
    if (showCorporatePanel) {
      fetchTenantsList();
      fetchAssignedCorporates();
    }
  }, [showCorporatePanel]);

  const fetchTenantsList = async () => {
    setIsLoadingTenants(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/document/tenants-list`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        setTenantsList(data.tenants || []);
      } else {
        showToast("Failed to load corporates", "error");
      }
    } catch (err) {
      console.error("Error fetching tenants:", err);
      showToast("Failed to load corporates", "error");
    } finally {
      setIsLoadingTenants(false);
    }
  };

  const fetchAssignedCorporates = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/document/ai-editor-config`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        setAssignedCorporates(data.configs || []);
      }
    } catch (err) {
      console.error("Error fetching assigned corporates:", err);
    }
  };

  const handleAssignCorporates = async () => {
    if (selectedTenants.length === 0) {
      showToast("Please select at least one corporate", "error");
      return;
    }

    setIsAssigning(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/document/ai-editor-config/assign`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantIds: selectedTenants,
          enabledForEmployees: enableForEmployees,
          assignedBy: "Admin",
        }),
      });
      const data = await response.json();
      if (data.success) {
        showToast(data.message || "AI Document Editor assigned successfully!", "success");
        setSelectedTenants([]);
        setEnableForEmployees(false);
        fetchAssignedCorporates();
      } else {
        showToast(data.error || "Failed to assign", "error");
      }
    } catch (err) {
      console.error("Error assigning corporates:", err);
      showToast("Failed to assign AI Document Editor", "error");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveCorporate = async (tenantId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/document/ai-editor-config/${tenantId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        showToast("Access removed successfully", "success");
        fetchAssignedCorporates();
      } else {
        showToast(data.error || "Failed to remove", "error");
      }
    } catch (err) {
      console.error("Error removing corporate:", err);
      showToast("Failed to remove access", "error");
    }
  };

  const toggleTenantSelection = (tenantId: string) => {
    setSelectedTenants(prev => 
      prev.includes(tenantId) 
        ? prev.filter(id => id !== tenantId)
        : [...prev, tenantId]
    );
  };

  const filteredTenants = tenantsList.filter(t => 
    t.corporate_legal_name?.toLowerCase().includes(searchTenant.toLowerCase()) ||
    t.tenant_code?.toLowerCase().includes(searchTenant.toLowerCase())
  );

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    const fileType = file.type || "";
    const isSupported = Object.keys(SUPPORTED_TYPES).some(
      (type) => fileType.includes(type.split("/")[1]) || type === fileType
    ) || file.name.match(/\.(txt|md|csv|json|html|pdf|doc|docx|png|jpg|jpeg)$/i);

    if (!isSupported) {
      showToast("Unsupported file type. Please upload PDF, Image, or Text files.", "error");
      return;
    }

    setUploadedFile(file);
    setAiResponses({});
    setProcessedTabs({});
    setFilePreview(null);

    // For images, create preview
    const isImage = file.type?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name);
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }

    // Process with backend
    await processDocument(file);
  };

  // Process document with backend (FREE - Tesseract/pdf-parse)
  const processDocument = async (file: File) => {
    setIsProcessing(true);
    const isImage = file.type?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name);
    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
    
    setProcessingStatus(
      isImage ? "Extracting text using Tesseract OCR..." :
      isPdf ? "Extracting text from PDF..." :
      "Processing document..."
    );

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1] || result);
        };
        reader.readAsDataURL(file);
      });

      const response = await fetch(`${API_URL}/api/admin/document/parse`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileContent: base64,
          fileSize: file.size,
        }),
      });

      const data = await response.json();

      console.log("Document parse response:", data); // Debug log

      if (data.success && data.content) {
        setOriginalContent(data.content);
        setExtractionEngine(data.engine || "Local Processing");
        
        let successMsg = "Document processed successfully!";
        if (data.type === "pdf-extract") successMsg = `PDF text extracted (${data.numPages} pages) using ${data.engine}`;
        else if (data.type === "ocr-tesseract") successMsg = `OCR completed (${Math.round(data.confidence || 0)}% confidence)`;
        else if (data.type === "direct") successMsg = "Text file loaded";
        else if (data.type === "pdf-scanned") successMsg = "PDF appears to be scanned - see details";
        
        showToast(successMsg, data.type === "pdf-scanned" ? "info" : "success");
      } else {
        // Show the actual content/error from backend
        const errorContent = data.content || data.error || `[Unable to extract text from ${file.name}]\n\nPlease try a different file format.`;
        setOriginalContent(errorContent);
        setExtractionEngine(data.engine || "Error");
        showToast(data.error || "Document loaded with limited extraction", "info");
      }
    } catch (err) {
      console.error("Processing error:", err);
      setOriginalContent(`[Error processing ${file.name}]\n\nPlease try again or use a different file.`);
      showToast("Error processing document", "error");
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  // Process AI Analysis for a specific tab
  const processAIAnalysis = async (tabId: string) => {
    if (!originalContent || originalContent.startsWith("[")) {
      showToast("Please upload a valid document first", "error");
      return;
    }

    const tab = AI_TABS.find(t => t.id === tabId);
    if (!tab) return;

    setLoadingTabs(prev => ({ ...prev, [tabId]: true }));

    try {
      const response = await fetch(`${API_URL}/api/admin/document/ai-assist`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: tab.prompt,
          currentContent: originalContent,
          fileName: uploadedFile?.name || "document",
        }),
      });

      const data = await response.json();

      if (data.success && data.content) {
        setAiResponses(prev => ({ ...prev, [tabId]: data.content }));
        setProcessedTabs(prev => ({ ...prev, [tabId]: true }));
        showToast(`${tab.label} analysis complete!`, "success");
      } else {
        showToast(data.error || "AI analysis failed", "error");
      }
    } catch (err) {
      console.error("AI analysis error:", err);
      showToast("Failed to process AI analysis", "error");
    } finally {
      setLoadingTabs(prev => ({ ...prev, [tabId]: false }));
    }
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  // Export document
  const exportDocument = (format: "txt" | "md" | "html" | "docx" | "xlsx", content: string) => {
    if (!content) {
      showToast("No content to export", "error");
      return;
    }

    const fileName = uploadedFile?.name?.replace(/\.[^/.]+$/, "") || "document";
    
    if (format === "docx") {
      // Export as Word document using HTML conversion
      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>${fileName}</title>
        <style>
          body { font-family: Calibri, sans-serif; font-size: 11pt; line-height: 1.5; }
          h1 { font-size: 16pt; font-weight: bold; color: #1f2937; }
          h2 { font-size: 14pt; font-weight: bold; color: #374151; }
          h3 { font-size: 12pt; font-weight: bold; color: #4b5563; }
          ul, ol { margin: 10px 0; padding-left: 20px; }
          li { margin: 5px 0; }
        </style>
        </head>
        <body>${markdownToHtml(content)}</body>
        </html>
      `;
      const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}-${activeTab}.doc`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Exported as Word Document", "success");
      return;
    }
    
    if (format === "xlsx") {
      // Export as Excel-compatible CSV with tab separators
      const lines = content.split('\n').filter(l => l.trim());
      let csvContent = '';
      
      // Try to parse structured data
      lines.forEach(line => {
        // Handle markdown table rows
        if (line.includes('|')) {
          const cells = line.split('|').filter(c => c.trim() && !c.match(/^[\s-:]+$/));
          csvContent += cells.map(c => `"${c.trim()}"`).join('\t') + '\n';
        }
        // Handle key: value pairs
        else if (line.includes(':')) {
          const [key, ...valueParts] = line.split(':');
          const value = valueParts.join(':').trim();
          csvContent += `"${key.trim()}"\t"${value}"\n`;
        }
        // Handle comma-separated values
        else if (line.includes(',')) {
          const cells = line.split(',');
          csvContent += cells.map(c => `"${c.trim()}"`).join('\t') + '\n';
        }
        // Handle bullet points
        else if (line.match(/^[\s]*[-*•]\s+/)) {
          const text = line.replace(/^[\s]*[-*•]\s+/, '');
          csvContent += `"${text}"\n`;
        }
        // Handle numbered lists
        else if (line.match(/^\d+\.\s+/)) {
          const text = line.replace(/^\d+\.\s+/, '');
          csvContent += `"${text}"\n`;
        }
        else {
          csvContent += `"${line}"\n`;
        }
      });
      
      const blob = new Blob(['\ufeff' + csvContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}-${activeTab}.xls`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Exported as Excel", "success");
      return;
    }

    let exportContent = content;
    let mimeType = "text/plain";
    let extension = "txt";

    if (format === "html") {
      exportContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${uploadedFile?.name || "Document"}</title><style>body{font-family:system-ui,sans-serif;line-height:1.6;max-width:800px;margin:40px auto;padding:20px;}</style></head><body>${markdownToHtml(content)}</body></html>`;
      mimeType = "text/html";
      extension = "html";
    } else if (format === "md") {
      mimeType = "text/markdown";
      extension = "md";
    }

    const blob = new Blob([exportContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}-${activeTab}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported as ${format.toUpperCase()}`, "success");
  };

  // Copy to clipboard
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    showToast("Copied to clipboard!", "success");
  };

  // Apply text formatting
  const applyFormat = (format: "bold" | "italic" | "underline" | "heading") => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      showToast("Select text to format", "info");
      return;
    }
    
    const selectedText = selection.toString();
    if (!selectedText) {
      showToast("Select text to format", "info");
      return;
    }
    
    let formattedText = selectedText;
    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`;
        break;
      case "italic":
        formattedText = `*${selectedText}*`;
        break;
      case "underline":
        formattedText = `__${selectedText}__`;
        break;
      case "heading":
        formattedText = `\n## ${selectedText}\n`;
        break;
    }
    
    // Update the AI response with formatted text
    const currentResponse = aiResponses[activeTab] || "";
    const newResponse = currentResponse.replace(selectedText, formattedText);
    setAiResponses(prev => ({ ...prev, [activeTab]: newResponse }));
    setEditedAiResponses(prev => ({ ...prev, [activeTab]: true }));
    showToast(`Applied ${format} formatting`, "success");
  };

  // Handle AI response edit
  const handleAiResponseEdit = (newContent: string) => {
    setAiResponses(prev => ({ ...prev, [activeTab]: newContent }));
    setEditedAiResponses(prev => ({ ...prev, [activeTab]: true }));
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: colors.gray[50] }}>
      <AdminTopBar />

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        padding: "24px 32px",
        color: "white",
      }}>
        <div style={{ maxWidth: "1600px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 700, margin: 0 }}>📄 AI Document Editor</h1>
            <p style={{ opacity: 0.9, margin: "8px 0 0 0" }}>Upload documents, extract content, and analyze with AI</p>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={() => setShowCorporatePanel(!showCorporatePanel)}
              style={{
                padding: "10px 20px",
                background: showCorporatePanel ? "white" : "rgba(255,255,255,0.2)",
                color: showCorporatePanel ? colors.primary : "white",
                border: "2px solid white",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
            >
              🏢 {showCorporatePanel ? "Hide Panel" : "Add to Corporate"}
            </button>
            {uploadedFile && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "14px", opacity: 0.8 }}>{uploadedFile.name}</div>
                <div style={{ fontSize: "12px", opacity: 0.7 }}>{formatFileSize(uploadedFile.size)} • {extractionEngine}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Corporate Assignment Panel */}
      {showCorporatePanel && (
        <div style={{
          background: "white",
          borderBottom: `1px solid ${colors.gray[200]}`,
          padding: "20px 32px",
        }}>
          <div style={{ maxWidth: "1600px", margin: "0 auto" }}>
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              
              {/* Left: Select Corporates */}
              <div style={{ flex: "1", minWidth: "300px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: colors.gray[800], marginBottom: "12px" }}>
                  🏢 Assign AI Document Module to Corporates
                </h3>
                
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search by code or name..."
                  value={searchTenant}
                  onChange={(e) => setSearchTenant(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: `1px solid ${colors.gray[300]}`,
                    borderRadius: "8px",
                    fontSize: "14px",
                    marginBottom: "12px",
                  }}
                />

                {/* Multi-select dropdown */}
                <div style={{
                  border: `1px solid ${colors.gray[300]}`,
                  borderRadius: "8px",
                  maxHeight: "200px",
                  overflowY: "auto",
                  background: colors.gray[50],
                }}>
                  {isLoadingTenants ? (
                    <div style={{ padding: "20px", textAlign: "center", color: colors.gray[500] }}>
                      Loading corporates...
                    </div>
                  ) : filteredTenants.length === 0 ? (
                    <div style={{ padding: "20px", textAlign: "center", color: colors.gray[500] }}>
                      No corporates found
                    </div>
                  ) : (
                    filteredTenants.map((tenant) => {
                      const isAssigned = assignedCorporates.some(a => a.tenant_id === tenant.id);
                      const isSelected = selectedTenants.includes(tenant.id);
                      return (
                        <div
                          key={tenant.id}
                          onClick={() => !isAssigned && toggleTenantSelection(tenant.id)}
                          style={{
                            padding: "10px 14px",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            borderBottom: `1px solid ${colors.gray[200]}`,
                            cursor: isAssigned ? "not-allowed" : "pointer",
                            background: isSelected ? colors.primaryLight : isAssigned ? colors.gray[100] : "white",
                            opacity: isAssigned ? 0.6 : 1,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected || isAssigned}
                            disabled={isAssigned}
                            onChange={() => {}}
                            style={{ cursor: isAssigned ? "not-allowed" : "pointer" }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500, color: colors.gray[800], fontSize: "14px" }}>
                              <span style={{ 
                                background: colors.primary, 
                                color: "white", 
                                padding: "2px 6px", 
                                borderRadius: "4px", 
                                fontSize: "11px",
                                marginRight: "8px",
                              }}>
                                {tenant.tenant_code}
                              </span>
                              {tenant.corporate_legal_name || "—"}
                            </div>
                          </div>
                          {isAssigned && (
                            <span style={{ 
                              fontSize: "11px", 
                              color: colors.success, 
                              background: "#d1fae5",
                              padding: "2px 8px",
                              borderRadius: "4px",
                            }}>
                              ✓ Assigned
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Options */}
                <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: colors.gray[700] }}>
                    <input
                      type="checkbox"
                      checked={enableForEmployees}
                      onChange={(e) => setEnableForEmployees(e.target.checked)}
                    />
                    Also enable for employees
                  </label>
                  <button
                    onClick={handleAssignCorporates}
                    disabled={selectedTenants.length === 0 || isAssigning}
                    style={{
                      padding: "10px 24px",
                      background: selectedTenants.length === 0 ? colors.gray[300] : `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: selectedTenants.length === 0 ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {isAssigning ? "Assigning..." : `✓ Assign (${selectedTenants.length})`}
                  </button>
                </div>
              </div>

              {/* Right: Assigned Corporates */}
              <div style={{ flex: "1", minWidth: "300px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: colors.gray[800], marginBottom: "12px" }}>
                  ✅ Assigned Corporates ({assignedCorporates.length})
                </h3>
                <div style={{
                  border: `1px solid ${colors.gray[200]}`,
                  borderRadius: "8px",
                  maxHeight: "250px",
                  overflowY: "auto",
                  background: "white",
                }}>
                  {assignedCorporates.length === 0 ? (
                    <div style={{ padding: "20px", textAlign: "center", color: colors.gray[500] }}>
                      No corporates assigned yet
                    </div>
                  ) : (
                    assignedCorporates.map((config) => (
                      <div
                        key={config.tenant_id}
                        style={{
                          padding: "12px 14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          borderBottom: `1px solid ${colors.gray[100]}`,
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 500, color: colors.gray[800], fontSize: "14px" }}>
                            <span style={{ 
                              background: colors.success, 
                              color: "white", 
                              padding: "2px 6px", 
                              borderRadius: "4px", 
                              fontSize: "11px",
                              marginRight: "8px",
                            }}>
                              {config.tenant_code}
                            </span>
                            {config.tenant?.corporate_legal_name || "—"}
                          </div>
                          <div style={{ fontSize: "11px", color: colors.gray[500], marginTop: "4px" }}>
                            Assigned: {new Date(config.assigned_at).toLocaleDateString()}
                            {config.enabled_for_employees && (
                              <span style={{ marginLeft: "8px", color: colors.primary }}>• Employees enabled</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveCorporate(config.tenant_id)}
                          style={{
                            padding: "4px 10px",
                            background: colors.error,
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, padding: "24px 32px", maxWidth: "1600px", margin: "0 auto", width: "100%" }}>
        
        {/* Upload Area - Show when no file */}
        {!uploadedFile && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `3px dashed ${isDragging ? colors.primary : colors.gray[300]}`,
              borderRadius: "16px",
              padding: "80px 40px",
              textAlign: "center",
              cursor: "pointer",
              background: isDragging ? colors.primaryLight : "white",
              transition: "all 0.3s",
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>📁</div>
            <h3 style={{ fontSize: "24px", color: colors.gray[800], marginBottom: "8px" }}>
              Drop your document here
            </h3>
            <p style={{ color: colors.gray[500], marginBottom: "24px" }}>
              or click to browse • PDF, Images (JPG, PNG), Text files
            </p>
            <div style={{
              display: "inline-block",
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              color: "white",
              padding: "12px 32px",
              borderRadius: "10px",
              fontWeight: 600,
            }}>
              Select File
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.md,.csv,.json,.html,.png,.jpg,.jpeg,.gif,.webp"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              style={{ display: "none" }}
            />
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "40px",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px", animation: "pulse 1.5s infinite" }}>⏳</div>
            <h3 style={{ color: colors.gray[800], marginBottom: "8px" }}>{processingStatus}</h3>
            <p style={{ color: colors.gray[500] }}>Please wait while we extract the content...</p>
          </div>
        )}

        {/* Split View - Show when file is uploaded */}
        {uploadedFile && !isProcessing && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", minHeight: "600px" }}>
            
            {/* LEFT PANEL - Original Document */}
            <div style={{
              background: "white",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}>
              {/* Panel Header */}
              <div style={{
                padding: "16px 20px",
                borderBottom: `1px solid ${colors.gray[200]}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: isDocumentEdited ? colors.warning + "15" : colors.gray[50],
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: colors.gray[800] }}>
                      📄 Original Document
                    </h3>
                    {isDocumentEdited && (
                      <span style={{
                        background: colors.warning,
                        color: "white",
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: 600,
                        animation: "pulse 2s infinite",
                      }}>
                        ✏️ EDITED
                      </span>
                    )}
                  </div>
                  <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: colors.gray[500] }}>
                    {isDocumentEdited ? "You have modified this content" : "Extracted content from your file"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setUploadedFile(null);
                    setOriginalContent("");
                    setAiResponses({});
                    setProcessedTabs({});
                    setFilePreview(null);
                    setIsDocumentEdited(false);
                  }}
                  style={{
                    padding: "8px 16px",
                    background: colors.gray[100],
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "13px",
                    color: colors.gray[600],
                  }}
                >
                  ↺ Upload New
                </button>
              </div>

              {/* Image Preview (if applicable) */}
              {filePreview && (
                <div style={{ padding: "16px", borderBottom: `1px solid ${colors.gray[200]}`, background: colors.gray[100] }}>
                  <img
                    src={filePreview}
                    alt="Document preview"
                    style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "8px", objectFit: "contain" }}
                  />
                </div>
              )}

              {/* Document Content - Editable */}
              <div style={{ flex: 1, overflow: "auto", padding: "20px" }}>
                <textarea
                  value={originalContent}
                  onChange={(e) => {
                    setOriginalContent(e.target.value);
                    if (!isDocumentEdited) setIsDocumentEdited(true);
                    // Clear AI responses when content changes
                    setAiResponses({});
                    setProcessedTabs({});
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    minHeight: "400px",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    fontSize: "14px",
                    lineHeight: "1.7",
                    color: colors.gray[700],
                    border: isDocumentEdited ? `2px solid ${colors.warning}` : `1px solid ${colors.gray[200]}`,
                    borderRadius: "8px",
                    padding: "16px",
                    resize: "none",
                    outline: "none",
                    background: isDocumentEdited ? colors.warning + "08" : "white",
                    transition: "all 0.2s",
                  }}
                  placeholder="Document content will appear here after upload..."
                />
              </div>

              {/* Panel Footer */}
              <div style={{
                padding: "12px 20px",
                borderTop: `1px solid ${colors.gray[200]}`,
                background: isDocumentEdited ? colors.warning + "10" : colors.gray[50],
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <span style={{ fontSize: "12px", color: isDocumentEdited ? colors.warning : colors.gray[500] }}>
                  {isDocumentEdited && "✎ "}
                  {originalContent.trim().split(/\s+/).length} words • {originalContent.length} chars
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  {isDocumentEdited && (
                    <button
                      onClick={() => {
                        if (uploadedFile) {
                          processDocument(uploadedFile);
                          setIsDocumentEdited(false);
                          setAiResponses({});
                          setProcessedTabs({});
                        }
                      }}
                      style={{
                        padding: "6px 12px",
                        background: colors.warning,
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      ↺ Reset
                    </button>
                  )}
                  <button
                    onClick={() => copyToClipboard(originalContent)}
                    style={{
                      padding: "6px 12px",
                      background: colors.primary,
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL - AI Analysis */}
            <div style={{
              background: "white",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}>
              {/* AI Tabs */}
              <div style={{
                display: "flex",
                gap: "4px",
                padding: "12px 16px",
                borderBottom: `1px solid ${colors.gray[200]}`,
                background: colors.gray[50],
                overflowX: "auto",
              }}>
                {AI_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: "10px 16px",
                      background: activeTab === tab.id 
                        ? `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` 
                        : "white",
                      color: activeTab === tab.id ? "white" : colors.gray[600],
                      border: activeTab === tab.id ? "none" : `1px solid ${colors.gray[200]}`,
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s",
                    }}
                  >
                    {tab.icon} {tab.label}
                    {processedTabs[tab.id] && <span style={{ fontSize: "10px" }}>✓</span>}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {/* Process Button Area */}
                {!processedTabs[activeTab] && !loadingTabs[activeTab] && (
                  <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "40px",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                      {AI_TABS.find(t => t.id === activeTab)?.icon}
                    </div>
                    <h3 style={{ color: colors.gray[800], marginBottom: "8px" }}>
                      {AI_TABS.find(t => t.id === activeTab)?.label}
                    </h3>
                    <p style={{ color: colors.gray[500], marginBottom: "24px", maxWidth: "300px" }}>
                      Click the button below to analyze your document using AI
                    </p>
                    <button
                      onClick={() => processAIAnalysis(activeTab)}
                      style={{
                        padding: "14px 32px",
                        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontSize: "15px",
                        fontWeight: 600,
                        boxShadow: "0 4px 15px rgba(99, 102, 241, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      ✨ Process with AI
                    </button>
                    <p style={{ fontSize: "12px", color: colors.gray[400], marginTop: "16px" }}>
                      Uses Groq AI (llama-3.3-70b)
                    </p>
                  </div>
                )}

                {/* Loading State */}
                {loadingTabs[activeTab] && (
                  <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "40px",
                  }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px", animation: "spin 1s linear infinite" }}>⚙️</div>
                    <h3 style={{ color: colors.gray[800], marginBottom: "8px" }}>Processing...</h3>
                    <p style={{ color: colors.gray[500] }}>AI is analyzing your document</p>
                  </div>
                )}

                {/* AI Response */}
                {processedTabs[activeTab] && aiResponses[activeTab] && !loadingTabs[activeTab] && (
                  <>
                    {/* Formatting Toolbar */}
                    <div style={{
                      padding: "8px 16px",
                      borderBottom: `1px solid ${colors.gray[200]}`,
                      background: colors.gray[50],
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}>
                      {/* View Mode Toggle */}
                      <div style={{ 
                        display: "flex", 
                        background: colors.gray[200], 
                        borderRadius: "6px", 
                        padding: "2px",
                        marginRight: "12px",
                      }}>
                        <button
                          onClick={() => setViewMode("formatted")}
                          style={{
                            padding: "4px 10px",
                            background: viewMode === "formatted" ? "white" : "transparent",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "11px",
                            fontWeight: viewMode === "formatted" ? 600 : 400,
                            color: viewMode === "formatted" ? colors.primary : colors.gray[600],
                            boxShadow: viewMode === "formatted" ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                          }}
                        >
                          👁 View
                        </button>
                        <button
                          onClick={() => setViewMode("edit")}
                          style={{
                            padding: "4px 10px",
                            background: viewMode === "edit" ? "white" : "transparent",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "11px",
                            fontWeight: viewMode === "edit" ? 600 : 400,
                            color: viewMode === "edit" ? colors.primary : colors.gray[600],
                            boxShadow: viewMode === "edit" ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                          }}
                        >
                          ✎ Edit
                        </button>
                      </div>

                      {viewMode === "formatted" && (
                        <>
                          <span style={{ fontSize: "12px", color: colors.gray[500], marginRight: "8px" }}>Format:</span>
                          <button
                            onClick={() => applyFormat("bold")}
                            title="Bold (select text first)"
                            style={{
                              padding: "4px 10px",
                              background: "white",
                              border: `1px solid ${colors.gray[300]}`,
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontWeight: "bold",
                              fontSize: "13px",
                            }}
                          >
                            B
                          </button>
                          <button
                            onClick={() => applyFormat("italic")}
                            title="Italic (select text first)"
                            style={{
                              padding: "4px 10px",
                              background: "white",
                              border: `1px solid ${colors.gray[300]}`,
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontStyle: "italic",
                              fontSize: "13px",
                            }}
                          >
                            I
                          </button>
                          <button
                            onClick={() => applyFormat("underline")}
                            title="Underline (select text first)"
                            style={{
                              padding: "4px 10px",
                              background: "white",
                              border: `1px solid ${colors.gray[300]}`,
                              borderRadius: "4px",
                              cursor: "pointer",
                              textDecoration: "underline",
                              fontSize: "13px",
                            }}
                          >
                            U
                          </button>
                          <button
                            onClick={() => applyFormat("heading")}
                            title="Make Heading (select text first)"
                            style={{
                              padding: "4px 10px",
                              background: "white",
                              border: `1px solid ${colors.gray[300]}`,
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "13px",
                              fontWeight: "bold",
                            }}
                          >
                            H
                          </button>
                        </>
                      )}
                      <div style={{ flex: 1 }} />
                      {editedAiResponses[activeTab] && (
                        <span style={{
                          fontSize: "11px",
                          color: colors.warning,
                          background: "#fef3c7",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontWeight: 500,
                        }}>
                          ✎ EDITED
                        </span>
                      )}
                    </div>

                    {/* Formatted Response Display (View Mode) */}
                    {viewMode === "formatted" && (
                      <div 
                        ref={aiResponseRef}
                        style={{ 
                          flex: 1, 
                          overflow: "auto", 
                          padding: "20px",
                          background: "white",
                        }}
                      >
                        <div
                          dangerouslySetInnerHTML={{ __html: markdownToHtml(aiResponses[activeTab]) }}
                          style={{
                            fontSize: "14px",
                            lineHeight: "1.7",
                            color: colors.gray[700],
                          }}
                        />
                      </div>
                    )}

                    {/* Raw Edit Mode */}
                    {viewMode === "edit" && (
                      <div style={{ flex: 1, padding: "16px", overflow: "auto" }}>
                        <textarea
                          value={aiResponses[activeTab]}
                          onChange={(e) => handleAiResponseEdit(e.target.value)}
                          style={{
                            width: "100%",
                            height: "100%",
                            minHeight: "300px",
                            padding: "16px",
                            border: `2px solid ${colors.gray[200]}`,
                            borderRadius: "8px",
                            fontSize: "14px",
                            lineHeight: "1.6",
                            fontFamily: "Monaco, Consolas, monospace",
                            resize: "none",
                            outline: "none",
                          }}
                          placeholder="Edit your content here using Markdown syntax..."
                        />
                        <p style={{ 
                          fontSize: "11px", 
                          color: colors.gray[500], 
                          marginTop: "8px",
                          display: "flex",
                          gap: "12px",
                        }}>
                          <span><strong>**bold**</strong></span>
                          <span><em>*italic*</em></span>
                          <span>## Heading</span>
                          <span>- bullet list</span>
                        </p>
                      </div>
                    )}

                    {/* Response Footer */}
                    <div style={{
                      padding: "12px 20px",
                      borderTop: `1px solid ${colors.gray[200]}`,
                      background: colors.gray[50],
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => {
                            setProcessedTabs(prev => ({ ...prev, [activeTab]: false }));
                            setAiResponses(prev => ({ ...prev, [activeTab]: "" }));
                            setEditedAiResponses(prev => ({ ...prev, [activeTab]: false }));
                          }}
                          style={{
                            padding: "6px 12px",
                            background: colors.gray[200],
                            color: colors.gray[700],
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          ↺ Regenerate
                        </button>
                        <button
                          onClick={() => copyToClipboard(aiResponses[activeTab])}
                          style={{
                            padding: "6px 12px",
                            background: colors.primary,
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          📋 Copy
                        </button>
                      </div>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <button
                          onClick={() => exportDocument("txt", aiResponses[activeTab])}
                          style={{
                            padding: "6px 10px",
                            background: colors.gray[100],
                            color: colors.gray[700],
                            border: `1px solid ${colors.gray[200]}`,
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "11px",
                          }}
                        >
                          TXT
                        </button>
                        <button
                          onClick={() => exportDocument("md", aiResponses[activeTab])}
                          style={{
                            padding: "6px 10px",
                            background: colors.gray[100],
                            color: colors.gray[700],
                            border: `1px solid ${colors.gray[200]}`,
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "11px",
                          }}
                        >
                          MD
                        </button>
                        <button
                          onClick={() => exportDocument("html", aiResponses[activeTab])}
                          style={{
                            padding: "6px 10px",
                            background: colors.gray[100],
                            color: colors.gray[700],
                            border: `1px solid ${colors.gray[200]}`,
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "11px",
                          }}
                        >
                          HTML
                        </button>
                        <button
                          onClick={() => exportDocument("docx", aiResponses[activeTab])}
                          style={{
                            padding: "6px 10px",
                            background: "#2563eb",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "11px",
                            fontWeight: 500,
                          }}
                        >
                          📄 Word
                        </button>
                        {hasTabularData(aiResponses[activeTab]) && (
                          <button
                            onClick={() => exportDocument("xlsx", aiResponses[activeTab])}
                            style={{
                              padding: "6px 10px",
                              background: "#16a34a",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "11px",
                              fontWeight: 500,
                            }}
                          >
                            📊 Excel
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <AdminFooter />

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Animations */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
