"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://benefitnest-backend.onrender.com";

interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  category?: string;
  subcategory?: string;
  employee_id?: string;
  employee_name?: string;
  employee_email?: string;
  current_assignee_id?: string;
  assignee_name?: string;
  assigned_team?: string;
  due_at?: string;
  first_response_at?: string;
  first_response_due_at?: string;
  resolved_at?: string;
  closed_at?: string;
  sla_breached?: boolean;
  sla_paused_at?: string;
  red_flag_score?: number;
  ai_sentiment?: string;
  ai_category_suggestion?: string;
  ai_priority_suggestion?: string;
  tags?: string[];
  channel?: string;
  form_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
  feature?: { id: string; name: string; icon: string };
  sla_policy?: { name: string; first_response_minutes: number; resolution_target_minutes: number };
  comments?: Comment[];
  events?: Event[];
  attachments?: Attachment[];
}

interface Comment {
  id: string;
  body: string;
  body_html?: string;
  is_internal_note: boolean;
  is_auto_reply: boolean;
  author_id?: string;
  author_email?: string;
  author_name?: string;
  author_role: string;
  sentiment?: string;
  attachments?: any[];
  created_at: string;
}

interface Event {
  id: string;
  event_type: string;
  old_value?: any;
  new_value?: any;
  actor_name?: string;
  actor_role?: string;
  created_at: string;
}

interface Attachment {
  id: string;
  filename: string;
  url: string;
  mime_type?: string;
  size_bytes?: number;
  is_image?: boolean;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: "new", label: "New", color: "bg-blue-100 text-blue-800" },
  { value: "open", label: "Open", color: "bg-yellow-100 text-yellow-800" },
  { value: "in_progress", label: "In Progress", color: "bg-purple-100 text-purple-800" },
  { value: "awaiting_customer", label: "Awaiting Customer", color: "bg-orange-100 text-orange-800" },
  { value: "awaiting_internal", label: "Awaiting Internal", color: "bg-indigo-100 text-indigo-800" },
  { value: "escalated", label: "Escalated", color: "bg-red-100 text-red-800" },
  { value: "resolved", label: "Resolved", color: "bg-green-100 text-green-800" },
  { value: "closed", label: "Closed", color: "bg-gray-100 text-gray-800" },
];

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-600 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-black",
  low: "bg-blue-400 text-white",
};

export default function AdminTicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params?.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Comment form
  const [newComment, setNewComment] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // AI suggestions
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [shouldEscalate, setShouldEscalate] = useState<{ shouldEscalate: boolean; reasons: string[] } | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    const tenantId = localStorage.getItem("tenant_id") || localStorage.getItem("tenantId");
    const userId = localStorage.getItem("user_id");
    const userEmail = localStorage.getItem("email");
    const userName = localStorage.getItem("name") || "Admin";

    return {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
      "x-tenant-id": tenantId || "",
      "x-user-id": userId || "",
      "x-user-email": userEmail || "",
      "x-user-name": userName,
      "x-user-role": "admin",
    };
  };

  // Fetch ticket details
  const fetchTicket = async () => {
    try {
      const response = await fetch(`${API_URL}/api/helpdesk/tickets/${ticketId}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        setTicket(data.data);
      }
    } catch (error) {
      console.error("Error fetching ticket:", error);
    }
  };

  // Fetch AI suggestions
  const fetchAiSuggestions = async () => {
    try {
      const [suggestionsRes, escalateRes] = await Promise.all([
        fetch(`${API_URL}/api/helpdesk/tickets/${ticketId}/suggestions`, {
          headers: getAuthHeaders(),
        }),
        fetch(`${API_URL}/api/helpdesk/tickets/${ticketId}/should-escalate`, {
          headers: getAuthHeaders(),
        }),
      ]);

      const suggestionsData = await suggestionsRes.json();
      const escalateData = await escalateRes.json();

      if (suggestionsData.success) setAiSuggestions(suggestionsData.data || []);
      if (escalateData.success) setShouldEscalate(escalateData.data);
    } catch (error) {
      console.error("Error fetching AI data:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchTicket();
      await fetchAiSuggestions();
      setLoading(false);
    };
    if (ticketId) loadData();
  }, [ticketId]);

  // Update ticket
  const updateTicket = async (updates: any) => {
    setUpdating(true);
    try {
      const response = await fetch(`${API_URL}/api/helpdesk/tickets/${ticketId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (data.success) {
        fetchTicket();
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
    setUpdating(false);
  };

  // Add comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`${API_URL}/api/helpdesk/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          body: newComment,
          isInternalNote,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setNewComment("");
        setIsInternalNote(false);
        fetchTicket();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
    setSubmittingComment(false);
  };

  // Escalate ticket
  const handleEscalate = async () => {
    const note = prompt("Enter escalation note (optional):");
    try {
      const response = await fetch(`${API_URL}/api/helpdesk/tickets/${ticketId}/escalate`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ note }),
      });
      const data = await response.json();
      if (data.success) {
        alert("Ticket escalated");
        fetchTicket();
      }
    } catch (error) {
      console.error("Error escalating:", error);
    }
  };

  // Use canned response
  const useCannedResponse = (response: any) => {
    setNewComment(response.body);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString();
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ticket not found</h2>
          <button onClick={() => router.back()} className="text-indigo-600 hover:underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push("/admin/helpdesk")} className="p-2 hover:bg-gray-100 rounded-lg">
                ← Back
              </button>
              <div>
                <p className="text-sm text-gray-500">{ticket.ticket_number}</p>
                <h1 className="text-xl font-bold text-gray-900">{ticket.title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {ticket.sla_breached && (
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  ⚠️ SLA Breached
                </span>
              )}
              {(ticket.red_flag_score || 0) > 50 && (
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  🚩 Red Flag
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Escalation Warning */}
            {shouldEscalate?.shouldEscalate && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🚨</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-red-800">Escalation Recommended</h4>
                    <ul className="mt-1 text-sm text-red-600 list-disc list-inside">
                      {shouldEscalate.reasons.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={handleEscalate}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                  >
                    Escalate Now
                  </button>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {ticket.description || "No description provided."}
              </div>

              {/* Form Data */}
              {ticket.form_data && Object.keys(ticket.form_data).length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Additional Details</h4>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(ticket.form_data)
                      .filter(([key]) => !["title", "description"].includes(key))
                      .map(([key, value]) => (
                        <div key={key}>
                          <dt className="text-gray-500 capitalize">{key.replace(/_/g, " ")}</dt>
                          <dd className="font-medium text-gray-900">{String(value)}</dd>
                        </div>
                      ))}
                  </dl>
                </div>
              )}

              {/* Attachments */}
              {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Attachments</h4>
                  <div className="flex flex-wrap gap-2">
                    {ticket.attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm"
                      >
                        📎 {att.filename}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Conversation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Conversation</h3>
              </div>

              {/* Comments */}
              <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {ticket.comments?.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No replies yet</div>
                ) : (
                  ticket.comments?.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-4 ${comment.is_internal_note ? "bg-yellow-50" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            comment.author_role === "employee"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-indigo-100 text-indigo-600"
                          }`}
                        >
                          {(comment.author_name || "?")[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{comment.author_name || "Unknown"}</span>
                            <span className="text-xs text-gray-400">{comment.author_role}</span>
                            {comment.is_internal_note && (
                              <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">
                                Internal Note
                              </span>
                            )}
                            <span className="text-xs text-gray-400">{getTimeAgo(comment.created_at)}</span>
                          </div>
                          <div className="text-gray-700 text-sm whitespace-pre-wrap">{comment.body}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Reply Form */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <form onSubmit={handleAddComment}>
                  {/* AI Suggestions */}
                  {aiSuggestions.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-2">💡 Suggested Responses:</p>
                      <div className="flex flex-wrap gap-2">
                        {aiSuggestions.slice(0, 3).map((s, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => useCannedResponse(s)}
                            className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs hover:bg-indigo-100"
                          >
                            {s.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type your reply..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isInternalNote}
                        onChange={(e) => setIsInternalNote(e.target.checked)}
                        className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                      />
                      <span className="text-sm text-gray-600">Internal note (not visible to employee)</span>
                    </label>
                    <button
                      type="submit"
                      disabled={submittingComment || !newComment.trim()}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
                    >
                      {submittingComment ? "Sending..." : "Send Reply"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Activity</h3>
              <div className="space-y-4">
                {ticket.events?.slice(0, 10).map((event) => (
                  <div key={event.id} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 mt-2 rounded-full bg-gray-300"></div>
                    <div className="flex-1">
                      <p className="text-gray-700">
                        <span className="font-medium">{event.actor_name || "System"}</span>{" "}
                        {event.event_type.replace(/_/g, " ")}
                        {event.new_value?.status && ` to "${event.new_value.status}"`}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(event.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Priority */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Properties</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Status</label>
                  <select
                    value={ticket.status}
                    onChange={(e) => updateTicket({ status: e.target.value })}
                    disabled={updating}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-500 block mb-1">Priority</label>
                  <select
                    value={ticket.priority}
                    onChange={(e) => updateTicket({ priority: e.target.value })}
                    disabled={updating}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-500 block mb-1">Category</label>
                  <p className="font-medium text-gray-900">
                    {ticket.feature?.icon} {ticket.feature?.name || ticket.category || "-"}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-500 block mb-1">Assigned To</label>
                  <p className="font-medium text-gray-900">{ticket.assignee_name || "Unassigned"}</p>
                  {ticket.assigned_team && (
                    <p className="text-xs text-gray-500">{ticket.assigned_team}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Requester Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Requester</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900">{ticket.employee_name || "Unknown"}</p>
                  <p className="text-sm text-gray-500">{ticket.employee_email}</p>
                </div>
                <div className="pt-3 border-t border-gray-100 text-sm">
                  <p className="text-gray-500">Channel: <span className="text-gray-900 capitalize">{ticket.channel || "web"}</span></p>
                </div>
              </div>
            </div>

            {/* SLA Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">SLA</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Policy</span>
                  <span className="text-gray-900">{ticket.sla_policy?.name || "Default"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">First Response Due</span>
                  <span className={ticket.first_response_at ? "text-green-600" : "text-gray-900"}>
                    {ticket.first_response_at ? "✓ Responded" : formatDate(ticket.first_response_due_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Resolution Due</span>
                  <span className={ticket.sla_breached ? "text-red-600 font-medium" : "text-gray-900"}>
                    {formatDate(ticket.due_at)}
                  </span>
                </div>
                {ticket.sla_paused_at && (
                  <div className="px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-xs">
                    ⏸️ SLA paused (awaiting customer)
                  </div>
                )}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">🤖 AI Insights</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sentiment</span>
                  <span className={`font-medium capitalize ${
                    ticket.ai_sentiment === "frustrated" ? "text-red-600" :
                    ticket.ai_sentiment === "negative" ? "text-orange-600" :
                    ticket.ai_sentiment === "positive" ? "text-green-600" : "text-gray-600"
                  }`}>
                    {ticket.ai_sentiment || "Neutral"}
                  </span>
                </div>
                {ticket.ai_category_suggestion && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Suggested Category</span>
                    <span className="text-gray-900 capitalize">{ticket.ai_category_suggestion}</span>
                  </div>
                )}
                {ticket.ai_priority_suggestion && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Suggested Priority</span>
                    <span className="text-gray-900 capitalize">{ticket.ai_priority_suggestion}</span>
                  </div>
                )}
                {(ticket.red_flag_score || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Risk Score</span>
                    <span className={`font-medium ${ticket.red_flag_score! > 50 ? "text-red-600" : "text-gray-900"}`}>
                      {ticket.red_flag_score}/100
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-2">
                {!["resolved", "closed"].includes(ticket.status) && (
                  <>
                    <button
                      onClick={handleEscalate}
                      className="w-full px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-sm font-medium"
                    >
                      🚨 Escalate
                    </button>
                    <button
                      onClick={() => updateTicket({ status: "resolved" })}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                    >
                      ✓ Mark Resolved
                    </button>
                  </>
                )}
                {ticket.status === "resolved" && (
                  <button
                    onClick={() => updateTicket({ status: "closed" })}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
                  >
                    Close Ticket
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
