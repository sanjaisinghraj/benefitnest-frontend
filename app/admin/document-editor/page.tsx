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
  "application/vnd.ms-excel": { ext: "XLS", icon: "📊" },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { ext: "XLSX", icon: "📊" },
  "text/markdown": { ext: "MD", icon: "📋" },
  "application/json": { ext: "JSON", icon: "🔧" },
  "text/html": { ext: "HTML", icon: "🌐" },
  "image/png": { ext: "PNG", icon: "🖼️" },
  "image/jpeg": { ext: "JPEG", icon: "🖼️" },
  "image/jpg": { ext: "JPG", icon: "🖼️" },
};

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

// UI Components
const Button = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  onClick,
  disabled,
  loading,
  style: customStyle,
}: {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "danger" | "success" | "ghost" | "ai";
  size?: "xs" | "sm" | "md" | "lg";
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: React.CSSProperties;
}) => {
  const variants: Record<string, { bg: string; color: string; border: string }> = {
    primary: {
      bg: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
      color: "white",
      border: "none",
    },
    outline: {
      bg: "white",
      color: colors.gray[700],
      border: `2px solid ${colors.gray[200]}`,
    },
    danger: {
      bg: colors.error,
      color: "white",
      border: "none",
    },
    success: {
      bg: colors.success,
      color: "white",
      border: "none",
    },
    ghost: {
      bg: "transparent",
      color: colors.gray[600],
      border: "none",
    },
    ai: {
      bg: "linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)",
      color: "white",
      border: "none",
    },
  };
  const sizes: Record<string, { padding: string; fontSize: string }> = {
    xs: { padding: "4px 8px", fontSize: "11px" },
    sm: { padding: "6px 12px", fontSize: "12px" },
    md: { padding: "10px 18px", fontSize: "14px" },
    lg: { padding: "14px 28px", fontSize: "16px" },
  };
  const v = variants[variant];
  const s = sizes[size];
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        background: v.bg,
        color: v.color,
        border: v.border,
        borderRadius: "10px",
        padding: s.padding,
        fontSize: s.fontSize,
        fontWeight: 600,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.6 : 1,
        transition: "all 0.2s",
        boxShadow: variant === "ai" ? "0 4px 15px rgba(99, 102, 241, 0.3)" : "none",
        ...customStyle,
      }}
    >
      {loading ? "⏳" : icon}
      {children}
    </button>
  );
};

const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: "#10b981",
    error: "#ef4444",
    info: "#3b82f6",
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        backgroundColor: bgColors[type],
        color: "white",
        padding: "14px 20px",
        borderRadius: "10px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
        zIndex: 1001,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontSize: "14px",
        fontWeight: 500,
        maxWidth: "400px",
      }}
    >
      {type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}
      {message}
    </div>
  );
};

// Toolbar Button Component
const ToolbarButton = ({
  icon,
  label,
  onClick,
  active,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  active?: boolean;
}) => (
  <button
    onClick={onClick}
    title={label}
    style={{
      padding: "8px 12px",
      background: active ? colors.primaryLight : "transparent",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "16px",
      color: active ? colors.primary : colors.gray[600],
      transition: "all 0.2s",
    }}
  >
    {icon}
  </button>
);

// Main Component
export default function DocumentEditorPage() {
  // State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [documentContent, setDocumentContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("Untitled Document");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  };

  // Update word/char count
  const updateCounts = useCallback((text: string) => {
    setCharCount(text.length);
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
  }, []);

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setDocumentContent(text);
    updateCounts(text);
  };

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    // Check file type
    const fileType = file.type || "";
    const isSupported = Object.keys(SUPPORTED_TYPES).some(
      (type) => fileType.includes(type.split("/")[1]) || type === fileType
    );

    if (!isSupported && !file.name.match(/\.(txt|md|csv|json|html|pdf|doc|docx|xls|xlsx|png|jpg|jpeg)$/i)) {
      showToast("Unsupported file type. Please upload a supported document.", "error");
      return;
    }

    setUploadedFile(file);
    setDocumentTitle(file.name.replace(/\.[^/.]+$/, ""));

    // For text-based files, read directly
    if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      const text = await file.text();
      setDocumentContent(text);
      setOriginalContent(text);
      updateCounts(text);
      showToast("Text file loaded successfully!", "success");
      return;
    }

    // For JSON files
    if (file.type === "application/json" || file.name.endsWith(".json")) {
      const text = await file.text();
      try {
        const formatted = JSON.stringify(JSON.parse(text), null, 2);
        setDocumentContent(formatted);
        setOriginalContent(formatted);
        updateCounts(formatted);
        showToast("JSON file loaded and formatted!", "success");
      } catch {
        setDocumentContent(text);
        setOriginalContent(text);
        updateCounts(text);
      }
      return;
    }

    // For CSV files
    if (file.type === "text/csv" || file.name.endsWith(".csv")) {
      const text = await file.text();
      setDocumentContent(text);
      setOriginalContent(text);
      updateCounts(text);
      showToast("CSV file loaded successfully!", "success");
      return;
    }

    // For HTML files
    if (file.type === "text/html" || file.name.endsWith(".html")) {
      const text = await file.text();
      setDocumentContent(text);
      setOriginalContent(text);
      updateCounts(text);
      showToast("HTML file loaded successfully!", "success");
      return;
    }

    // For images, create preview and use AI to extract text
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      // Will process with AI
      await processWithAI(file);
      return;
    }

    // For PDF/DOC/DOCX/XLS/XLSX, process with AI
    await processWithAI(file);
  };

  // Process document with Groq AI
  const processWithAI = async (file: File) => {
    setIsProcessing(true);
    
    const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name);
    
    setProcessingStatus(isImage ? "Uploading image for OCR..." : "Uploading document...");

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

      setProcessingStatus(isImage ? "Extracting text from image with AI Vision..." : "Analyzing document with AI...");

      // Send to backend for AI processing
      const response = await fetch(`${API_URL}/api/admin/document/parse`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileContent: base64,
          fileSize: file.size,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setDocumentContent(data.content || data.text || "");
        setOriginalContent(data.content || data.text || "");
        updateCounts(data.content || data.text || "");
        
        // Show appropriate success message based on OCR engine used
        let successMsg = "Document processed successfully!";
        if (data.type === "ocr-groq") {
          successMsg = "Text extracted using Groq Vision AI!";
        } else if (data.type === "ocr-tesseract") {
          successMsg = `Text extracted using Tesseract OCR (${data.confidence ? Math.round(data.confidence) + "% confidence" : "local processing"})`;
        } else if (data.type === "ocr") {
          successMsg = "Text extracted from image successfully!";
        } else if (data.type === "direct") {
          successMsg = "Document loaded successfully!";
        }
        showToast(successMsg, "success");
      } else {
        // Fallback: show placeholder for manual editing
        const placeholder = data.content || `[Document: ${file.name}]\n\nThe AI document parser is processing your file.\n\nFile Details:\n- Name: ${file.name}\n- Type: ${file.type || "Unknown"}\n- Size: ${formatFileSize(file.size)}\n\nYou can start typing or use the AI assistant below to help extract and format content.`;
        setDocumentContent(placeholder);
        setOriginalContent(placeholder);
        updateCounts(placeholder);
        showToast(data.error || "Document loaded. Use AI assistant to help process content.", "info");
      }
    } catch (err) {
      console.error("Processing error:", err);
      const placeholder = `[Document: ${file.name}]\n\nFile loaded but requires AI processing.\n\nFile Details:\n- Name: ${file.name}\n- Type: ${file.type || "Unknown"}\n- Size: ${formatFileSize(file.size)}\n\nUse the AI assistant below to help extract and format content.`;
      setDocumentContent(placeholder);
      setOriginalContent(placeholder);
      updateCounts(placeholder);
      showToast("Document loaded. AI processing available via assistant.", "info");
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  // AI Assistant for document processing
  const handleAIAssist = async () => {
    if (!aiPrompt.trim()) {
      showToast("Please enter a prompt for the AI assistant", "error");
      return;
    }

    setIsAiProcessing(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/document/ai-assist`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          currentContent: documentContent,
          fileName: uploadedFile?.name || documentTitle,
        }),
      });

      const data = await response.json();

      if (data.success && data.content) {
        setDocumentContent(data.content);
        updateCounts(data.content);
        showToast("AI assistant updated the document!", "success");
        setAiPrompt("");
      } else {
        showToast(data.error || "AI processing failed", "error");
      }
    } catch (err) {
      console.error("AI assist error:", err);
      showToast("Failed to process AI request", "error");
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // File input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Text formatting helpers
  const insertAtCursor = (before: string, after: string = "") => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = documentContent;
    const selectedText = text.substring(start, end);

    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    setDocumentContent(newText);
    updateCounts(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = end + before.length;
    }, 0);
  };

  // Download document
  const handleDownload = (format: "txt" | "md" | "html") => {
    let content = documentContent;
    let mimeType = "text/plain";
    let extension = "txt";

    if (format === "md") {
      mimeType = "text/markdown";
      extension = "md";
    } else if (format === "html") {
      // Convert to basic HTML
      content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${documentTitle}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>${documentTitle}</h1>
  <div>${documentContent.replace(/\n/g, "<br>")}</div>
</body>
</html>`;
      mimeType = "text/html";
      extension = "html";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${documentTitle}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded as ${extension.toUpperCase()}!`, "success");
  };

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(documentContent);
      showToast("Copied to clipboard!", "success");
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  // Clear document
  const handleClear = () => {
    if (documentContent && !confirm("Are you sure you want to clear the document?")) return;
    setDocumentContent("");
    setOriginalContent("");
    setUploadedFile(null);
    setFilePreview(null);
    setDocumentTitle("Untitled Document");
    updateCounts("");
  };

  // Revert to original
  const handleRevert = () => {
    if (confirm("Revert to original content? All changes will be lost.")) {
      setDocumentContent(originalContent);
      updateCounts(originalContent);
      showToast("Reverted to original", "info");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${colors.gray[50]}, ${colors.primaryLight})`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AdminTopBar
        title="AI Document Editor"
        subtitle="Upload documents, extract content with AI, and edit"
        icon={<span style={{ fontSize: 24 }}>📄</span>}
        showBack={true}
      />

      <main style={{ padding: "24px 32px", maxWidth: "1400px", margin: "0 auto", flex: 1, width: "100%" }}>
        {/* Upload Section */}
        {!uploadedFile && !documentContent && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: isDragging ? colors.primaryLight : "white",
              border: `3px dashed ${isDragging ? colors.primary : colors.gray[300]}`,
              borderRadius: "20px",
              padding: "80px 40px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s",
              marginBottom: "24px",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.md,.json,.html,.png,.jpg,.jpeg"
              style={{ display: "none" }}
            />
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>
              {isDragging ? "📥" : "📄"}
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: 700, color: colors.gray[800], marginBottom: "12px" }}>
              {isDragging ? "Drop your file here" : "Upload a Document"}
            </h2>
            <p style={{ fontSize: "15px", color: colors.gray[500], marginBottom: "24px" }}>
              Drag & drop or click to browse
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px" }}>
              {Object.entries(SUPPORTED_TYPES).slice(0, 8).map(([, info]) => (
                <span
                  key={info.ext}
                  style={{
                    padding: "6px 12px",
                    background: colors.gray[100],
                    borderRadius: "20px",
                    fontSize: "12px",
                    color: colors.gray[600],
                  }}
                >
                  {info.icon} {info.ext}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Processing Overlay */}
        {isProcessing && (
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "60px 40px",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                border: `4px solid ${colors.gray[200]}`,
                borderTopColor: colors.primary,
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 20px",
              }}
            />
            <h3 style={{ fontSize: "18px", fontWeight: 600, color: colors.gray[800], marginBottom: "8px" }}>
              {processingStatus}
            </h3>
            <p style={{ fontSize: "14px", color: colors.gray[500] }}>
              Please wait while we process your document with AI...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Editor Section */}
        {(uploadedFile || documentContent) && !isProcessing && (
          <>
            {/* File Info Bar */}
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "16px 20px",
                marginBottom: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                {uploadedFile && (
                  <>
                    <span style={{ fontSize: "28px" }}>
                      {SUPPORTED_TYPES[uploadedFile.type as keyof typeof SUPPORTED_TYPES]?.icon || "📄"}
                    </span>
                    <div>
                      <input
                        type="text"
                        value={documentTitle}
                        onChange={(e) => setDocumentTitle(e.target.value)}
                        style={{
                          fontSize: "16px",
                          fontWeight: 600,
                          color: colors.gray[800],
                          border: "none",
                          background: "transparent",
                          outline: "none",
                          width: "300px",
                        }}
                      />
                      <div style={{ fontSize: "12px", color: colors.gray[500] }}>
                        {formatFileSize(uploadedFile.size)} • {uploadedFile.type || "Unknown type"}
                      </div>
                    </div>
                  </>
                )}
                {!uploadedFile && documentContent && (
                  <input
                    type="text"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    style={{
                      fontSize: "18px",
                      fontWeight: 600,
                      color: colors.gray[800],
                      border: "none",
                      background: "transparent",
                      outline: "none",
                      width: "300px",
                    }}
                  />
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "13px", color: colors.gray[500] }}>
                  {wordCount} words • {charCount} chars
                </span>
                <Button variant="outline" size="sm" icon="📤" onClick={() => fileInputRef.current?.click()}>
                  Upload New
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileInputChange}
                  accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.md,.json,.html,.png,.jpg,.jpeg"
                  style={{ display: "none" }}
                />
              </div>
            </div>

            {/* Image Preview */}
            {filePreview && uploadedFile?.type.startsWith("image/") && (
              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "16px",
                  textAlign: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <img
                  src={filePreview}
                  alt="Preview"
                  style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "8px" }}
                />
              </div>
            )}

            {/* Toolbar */}
            <div
              style={{
                background: "white",
                borderRadius: "12px 12px 0 0",
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                borderBottom: `1px solid ${colors.gray[200]}`,
                flexWrap: "wrap",
              }}
            >
              <ToolbarButton icon="𝐁" label="Bold" onClick={() => insertAtCursor("**", "**")} />
              <ToolbarButton icon="𝐼" label="Italic" onClick={() => insertAtCursor("*", "*")} />
              <ToolbarButton icon="U̲" label="Underline" onClick={() => insertAtCursor("<u>", "</u>")} />
              <div style={{ width: "1px", height: "24px", background: colors.gray[200], margin: "0 8px" }} />
              <ToolbarButton icon="H1" label="Heading 1" onClick={() => insertAtCursor("# ")} />
              <ToolbarButton icon="H2" label="Heading 2" onClick={() => insertAtCursor("## ")} />
              <ToolbarButton icon="H3" label="Heading 3" onClick={() => insertAtCursor("### ")} />
              <div style={{ width: "1px", height: "24px", background: colors.gray[200], margin: "0 8px" }} />
              <ToolbarButton icon="•" label="Bullet List" onClick={() => insertAtCursor("- ")} />
              <ToolbarButton icon="1." label="Numbered List" onClick={() => insertAtCursor("1. ")} />
              <ToolbarButton icon="❝" label="Quote" onClick={() => insertAtCursor("> ")} />
              <ToolbarButton icon="💻" label="Code Block" onClick={() => insertAtCursor("```\n", "\n```")} />
              <div style={{ width: "1px", height: "24px", background: colors.gray[200], margin: "0 8px" }} />
              <ToolbarButton icon="🔗" label="Link" onClick={() => insertAtCursor("[", "](url)")} />
              <ToolbarButton icon="📋" label="Copy" onClick={handleCopy} />
              <div style={{ flex: 1 }} />
              <Button variant="ghost" size="sm" icon="↩️" onClick={handleRevert} disabled={documentContent === originalContent}>
                Revert
              </Button>
              <Button variant="ghost" size="sm" icon="🗑️" onClick={handleClear}>
                Clear
              </Button>
            </div>

            {/* Text Editor */}
            <textarea
              ref={textAreaRef}
              value={documentContent}
              onChange={handleContentChange}
              placeholder="Start typing or paste content here..."
              style={{
                width: "100%",
                minHeight: "500px",
                padding: "24px",
                border: "none",
                borderRadius: "0 0 12px 12px",
                fontSize: "15px",
                lineHeight: "1.8",
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                resize: "vertical",
                outline: "none",
                background: "white",
                boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
              }}
            />

            {/* AI Assistant Section */}
            <div
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                borderRadius: "16px",
                padding: "24px",
                marginTop: "24px",
                boxShadow: "0 4px 20px rgba(99, 102, 241, 0.2)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <span style={{ fontSize: "24px" }}>🤖</span>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, color: "white", margin: 0 }}>
                    AI Document Assistant
                  </h3>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", margin: "4px 0 0" }}>
                    Ask AI to summarize, reformat, extract data, translate, or improve your document
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isAiProcessing && handleAIAssist()}
                  placeholder="e.g., 'Summarize this document', 'Extract all names and dates', 'Convert to bullet points'..."
                  style={{
                    flex: 1,
                    padding: "14px 18px",
                    borderRadius: "10px",
                    border: "none",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
                <Button
                  variant="outline"
                  onClick={handleAIAssist}
                  loading={isAiProcessing}
                  disabled={!aiPrompt.trim()}
                  style={{ background: "white", color: colors.primary }}
                >
                  ✨ Process
                </Button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
                {[
                  "Summarize document",
                  "Extract key points",
                  "Fix grammar & spelling",
                  "Convert to bullet points",
                  "Make it more professional",
                  "Simplify language",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setAiPrompt(suggestion)}
                    style={{
                      padding: "6px 12px",
                      background: "rgba(255,255,255,0.2)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      borderRadius: "20px",
                      color: "white",
                      fontSize: "12px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Export Section */}
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "20px 24px",
                marginTop: "24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: 600, color: colors.gray[800], margin: "0 0 4px" }}>
                  Export Document
                </h4>
                <p style={{ fontSize: "13px", color: colors.gray[500], margin: 0 }}>
                  Download your edited document in various formats
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <Button variant="outline" size="sm" icon="📃" onClick={() => handleDownload("txt")}>
                  Text (.txt)
                </Button>
                <Button variant="outline" size="sm" icon="📋" onClick={() => handleDownload("md")}>
                  Markdown (.md)
                </Button>
                <Button variant="primary" size="sm" icon="🌐" onClick={() => handleDownload("html")}>
                  HTML (.html)
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Start Fresh Button */}
        {!uploadedFile && !documentContent && (
          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <p style={{ fontSize: "14px", color: colors.gray[500], marginBottom: "16px" }}>
              Or start with a blank document
            </p>
            <Button
              variant="outline"
              icon="✍️"
              onClick={() => {
                setDocumentContent("");
                setDocumentTitle("New Document");
                setUploadedFile({ name: "New Document", size: 0, type: "text/plain" } as File);
              }}
            >
              Create Blank Document
            </Button>
          </div>
        )}
      </main>

      <AdminFooter />

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
