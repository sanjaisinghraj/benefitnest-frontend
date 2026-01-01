"use client";

import React, { useState, useRef, useCallback } from "react";
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
  
  // Track if original document was edited
  const [isDocumentEdited, setIsDocumentEdited] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  };

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
  const exportDocument = (format: "txt" | "md" | "html", content: string) => {
    if (!content) {
      showToast("No content to export", "error");
      return;
    }

    let exportContent = content;
    let mimeType = "text/plain";
    let extension = "txt";

    if (format === "html") {
      exportContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${uploadedFile?.name || "Document"}</title><style>body{font-family:system-ui,sans-serif;line-height:1.6;max-width:800px;margin:40px auto;padding:20px;}</style></head><body>${content.replace(/\n/g, "<br>")}</body></html>`;
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
    a.download = `${uploadedFile?.name?.replace(/\.[^/.]+$/, "") || "document"}-${activeTab}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported as ${format.toUpperCase()}`, "success");
  };

  // Copy to clipboard
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    showToast("Copied to clipboard!", "success");
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
          {uploadedFile && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "14px", opacity: 0.8 }}>{uploadedFile.name}</div>
              <div style={{ fontSize: "12px", opacity: 0.7 }}>{formatFileSize(uploadedFile.size)} • {extractionEngine}</div>
            </div>
          )}
        </div>
      </div>

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
                    <div style={{ flex: 1, overflow: "auto", padding: "20px" }}>
                      <pre style={{
                        fontFamily: "system-ui, -apple-system, sans-serif",
                        fontSize: "14px",
                        lineHeight: "1.7",
                        color: colors.gray[700],
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        margin: 0,
                      }}>
                        {aiResponses[activeTab]}
                      </pre>
                    </div>

                    {/* Response Footer */}
                    <div style={{
                      padding: "12px 20px",
                      borderTop: `1px solid ${colors.gray[200]}`,
                      background: colors.gray[50],
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => {
                            setProcessedTabs(prev => ({ ...prev, [activeTab]: false }));
                            setAiResponses(prev => ({ ...prev, [activeTab]: "" }));
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
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => exportDocument("txt", aiResponses[activeTab])}
                          style={{
                            padding: "6px 12px",
                            background: colors.gray[100],
                            color: colors.gray[700],
                            border: `1px solid ${colors.gray[200]}`,
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          TXT
                        </button>
                        <button
                          onClick={() => exportDocument("md", aiResponses[activeTab])}
                          style={{
                            padding: "6px 12px",
                            background: colors.gray[100],
                            color: colors.gray[700],
                            border: `1px solid ${colors.gray[200]}`,
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          MD
                        </button>
                        <button
                          onClick={() => exportDocument("html", aiResponses[activeTab])}
                          style={{
                            padding: "6px 12px",
                            background: colors.success,
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          HTML
                        </button>
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
