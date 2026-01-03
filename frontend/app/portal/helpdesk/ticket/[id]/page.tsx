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
  created_at: string;
  updated_at: string;
  due_at?: string;
  resolved_at?: string;
  feature?: { id: string; name: string; icon: string };
  comments?: Comment[];
  attachments?: Attachment[];
}

interface Comment {
  id: string;
  body: string;
  author_name?: string;
  author_role: string;
  is_auto_reply: boolean;
  created_at: string;
}

interface Attachment {
  id: string;
  filename: string;
  url: string;
  is_image?: boolean;
}

const STATUS_LABELS: Record<string, { label: string; description: string; color: string }> = {
  new: {
    label: "Submitted",
    description: "Your request has been received and is waiting to be reviewed.",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  open: {
    label: "Being Reviewed",
    description: "Our team is reviewing your request.",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  in_progress: {
    label: "In Progress",
    description: "We're actively working on your request.",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  awaiting_customer: {
    label: "We Need Your Input",
    description: "Please check the messages below and provide the requested information.",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  awaiting_internal: {
    label: "In Progress",
    description: "We're waiting for information from another team.",
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  escalated: {
    label: "Escalated",
    description: "Your request has been escalated to a senior team member.",
    color: "bg-red-100 text-red-700 border-red-200",
  },
  resolved: {
    label: "Resolved",
    description: "Your request has been resolved. Please let us know if you need anything else!",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  closed: {
    label: "Closed",
    description: "This ticket has been closed.",
    color: "bg-gray-100 text-gray-600 border-gray-200",
  },
  reopened: {
    label: "Reopened",
    description: "This ticket has been reopened and we're looking into it.",
    color: "bg-pink-100 text-pink-700 border-pink-200",
  },
};

export default function EmployeeTicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params?.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [newReply, setNewReply] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("employee_token") || localStorage.getItem("token");
    const tenantId = localStorage.getItem("tenant_id") || localStorage.getItem("tenantId");
    const employeeId = localStorage.getItem("employee_id") || localStorage.getItem("employeeId");
    const employeeEmail = localStorage.getItem("employee_email") || localStorage.getItem("email");
    const employeeName = localStorage.getItem("employee_name") || localStorage.getItem("name");

    return {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
      "x-tenant-id": tenantId || "",
      "x-employee-id": employeeId || "",
      "x-employee-email": employeeEmail || "",
      "x-employee-name": employeeName || "",
    };
  };

  // Fetch ticket
  const fetchTicket = async () => {
    try {
      const response = await fetch(`${API_URL}/api/helpdesk/employee/tickets/${ticketId}`, {
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchTicket();
      setLoading(false);
    };
    if (ticketId) loadData();
  }, [ticketId]);

  // Submit reply
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/helpdesk/employee/tickets/${ticketId}/reply`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ body: newReply }),
      });
      const data = await response.json();
      if (data.success) {
        setNewReply("");
        fetchTicket();
      }
    } catch (error) {
      console.error("Error sending reply:", error);
    }
    setSubmitting(false);
  };

  // Reopen ticket
  const handleReopen = async () => {
    const reason = prompt("Why do you need to reopen this ticket?");
    if (!reason) return;

    try {
      const response = await fetch(`${API_URL}/api/helpdesk/tickets/${ticketId}/reopen`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason }),
      });
      const data = await response.json();
      if (data.success) {
        alert("Ticket reopened successfully");
        fetchTicket();
      } else {
        alert(data.message || "Could not reopen ticket");
      }
    } catch (error) {
      console.error("Error reopening:", error);
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ticket not found</h2>
          <button onClick={() => router.back()} className="text-indigo-600 hover:underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[ticket.status] || { label: ticket.status, description: "", color: "bg-gray-100" };
  const needsAction = ticket.status === "awaiting_customer";
  const isResolved = ["resolved", "closed"].includes(ticket.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/portal/helpdesk")} className="p-2 hover:bg-gray-100 rounded-lg">
              ←
            </button>
            <div className="flex-1">
              <p className="text-xs text-gray-400">{ticket.ticket_number}</p>
              <h1 className="font-bold text-gray-900 truncate">{ticket.title}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Status Card */}
        <div className={`p-4 rounded-2xl border-2 ${statusInfo.color}`}>
          <div className="flex items-center gap-3">
            {needsAction && <span className="text-2xl animate-pulse">⚠️</span>}
            {isResolved && <span className="text-2xl">✅</span>}
            {!needsAction && !isResolved && <span className="text-2xl">📋</span>}
            <div>
              <h3 className="font-bold text-lg">{statusInfo.label}</h3>
              <p className="text-sm opacity-80">{statusInfo.description}</p>
            </div>
          </div>
        </div>

        {/* Original Request */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            {ticket.feature && (
              <span className="text-2xl">{ticket.feature.icon}</span>
            )}
            <div>
              <p className="text-sm text-gray-500">{ticket.feature?.name || ticket.category}</p>
              <p className="text-xs text-gray-400">Submitted {getTimeAgo(ticket.created_at)}</p>
            </div>
          </div>
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
            {ticket.description || "No description provided."}
          </div>

          {/* Attachments */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-2">Attachments</p>
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Conversation</h3>
          </div>

          {/* Messages */}
          <div className="divide-y divide-gray-100">
            {ticket.comments?.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <span className="text-4xl mb-3 block">💬</span>
                <p>No messages yet</p>
                <p className="text-sm">We'll respond to your request as soon as possible.</p>
              </div>
            ) : (
              ticket.comments?.map((comment) => {
                const isEmployee = comment.author_role === "employee";
                return (
                  <div
                    key={comment.id}
                    className={`p-4 ${isEmployee ? "bg-indigo-50/50" : "bg-white"}`}
                  >
                    <div className={`flex ${isEmployee ? "flex-row-reverse" : "flex-row"} gap-3`}>
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
                          isEmployee
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {isEmployee ? "You" : "🛟"}
                      </div>
                      <div className={`flex-1 ${isEmployee ? "text-right" : "text-left"}`}>
                        <div className="flex items-center gap-2 mb-1 justify-start">
                          {!isEmployee && (
                            <span className="font-medium text-gray-900 text-sm">
                              {comment.author_name || "Support Team"}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">{getTimeAgo(comment.created_at)}</span>
                        </div>
                        <div
                          className={`inline-block p-3 rounded-2xl text-sm max-w-[85%] text-left ${
                            isEmployee
                              ? "bg-indigo-600 text-white rounded-tr-sm"
                              : "bg-gray-100 text-gray-700 rounded-tl-sm"
                          }`}
                        >
                          <div className="whitespace-pre-wrap">{comment.body}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Reply Form */}
          {!isResolved ? (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <form onSubmit={handleSubmitReply}>
                <div className="flex gap-3">
                  <textarea
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder={
                      needsAction
                        ? "Please provide the requested information..."
                        : "Type your message..."
                    }
                    rows={2}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm"
                  />
                  <button
                    type="submit"
                    disabled={submitting || !newReply.trim()}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium self-end"
                  >
                    {submitting ? "..." : "Send"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-4 border-t border-gray-200 bg-green-50 text-center">
              <p className="text-green-700 mb-3">This ticket has been resolved.</p>
              <button
                onClick={handleReopen}
                className="px-4 py-2 border border-green-600 text-green-700 rounded-lg hover:bg-green-100 text-sm font-medium"
              >
                Reopen Ticket
              </button>
            </div>
          )}
        </div>

        {/* Ticket Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Ticket Details</h3>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Ticket Number</dt>
              <dd className="font-medium text-gray-900">{ticket.ticket_number}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Status</dt>
              <dd className="font-medium text-gray-900">{statusInfo.label}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Submitted</dt>
              <dd className="font-medium text-gray-900">
                {new Date(ticket.created_at).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Last Updated</dt>
              <dd className="font-medium text-gray-900">
                {new Date(ticket.updated_at).toLocaleDateString()}
              </dd>
            </div>
            {ticket.resolved_at && (
              <div className="col-span-2">
                <dt className="text-gray-500">Resolved</dt>
                <dd className="font-medium text-green-600">
                  {new Date(ticket.resolved_at).toLocaleDateString()}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
