"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://benefitnest-backend.onrender.com";

interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  category?: string;
  employee_name?: string;
  employee_email?: string;
  assignee_name?: string;
  assigned_team?: string;
  due_at?: string;
  sla_breached?: boolean;
  red_flag_score?: number;
  ai_sentiment?: string;
  created_at: string;
  updated_at: string;
  first_response_at?: string;
  resolved_at?: string;
  feature?: { name: string; icon: string };
}

interface Feature {
  id: string;
  key: string;
  name: string;
  icon: string;
}

interface Analytics {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  slaCompliance: {
    percentage: number;
    met: number;
    breached: number;
  };
  avgResolutionMinutes: number;
  avgFirstResponseMinutes: number;
  redFlagCount: number;
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  open: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-purple-100 text-purple-800",
  awaiting_customer: "bg-orange-100 text-orange-800",
  awaiting_internal: "bg-indigo-100 text-indigo-800",
  escalated: "bg-red-100 text-red-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
  reopened: "bg-pink-100 text-pink-800",
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-600 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-black",
  low: "bg-blue-400 text-white",
};

export default function AdminHelpdeskPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [featureFilter, setFeatureFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOverdue, setShowOverdue] = useState(false);
  const [showRedFlags, setShowRedFlags] = useState(false);
  
  // Tab
  const [activeTab, setActiveTab] = useState<"tickets" | "analytics" | "settings">("tickets");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalTickets, setTotalTickets] = useState(0);
  const limit = 20;

  // Get tenant from localStorage
  const getTenantId = () => {
    if (typeof window !== "undefined") {
      const tenant = localStorage.getItem("tenant_id") || localStorage.getItem("tenantId");
      return tenant;
    }
    return null;
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    const tenantId = getTenantId();
    return {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
      "x-tenant-id": tenantId || "",
    };
  };

  // Fetch tickets
  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (priorityFilter) params.append("priority", priorityFilter);
      if (featureFilter) params.append("featureId", featureFilter);
      if (searchQuery) params.append("search", searchQuery);
      if (showOverdue) params.append("overdue", "true");
      if (showRedFlags) params.append("redFlag", "true");
      params.append("limit", String(limit));
      params.append("offset", String((page - 1) * limit));

      const response = await fetch(`${API_URL}/api/helpdesk/tickets?${params}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        setTickets(data.data);
        setTotalTickets(data.total || 0);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  // Fetch features
  const fetchFeatures = async () => {
    try {
      const response = await fetch(`${API_URL}/api/helpdesk/features`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        setFeatures(data.data);
      }
    } catch (error) {
      console.error("Error fetching features:", error);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/helpdesk/analytics`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTickets(), fetchFeatures(), fetchAnalytics()]);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, featureFilter, searchQuery, showOverdue, showRedFlags, page]);

  // Update ticket status
  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_URL}/api/helpdesk/tickets/${ticketId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        fetchTickets();
        fetchAnalytics();
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };

  // Escalate ticket
  const escalateTicket = async (ticketId: string) => {
    const note = prompt("Enter escalation note (optional):");
    try {
      const response = await fetch(`${API_URL}/api/helpdesk/tickets/${ticketId}/escalate`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ note }),
      });
      const data = await response.json();
      if (data.success) {
        alert("Ticket escalated successfully");
        fetchTickets();
      }
    } catch (error) {
      console.error("Error escalating ticket:", error);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString();
  };

  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
    return `${Math.round(minutes / 1440)}d`;
  };

  const getTimeRemaining = (dueAt?: string) => {
    if (!dueAt) return null;
    const now = new Date();
    const due = new Date(dueAt);
    const diff = due.getTime() - now.getTime();
    const minutes = Math.round(diff / 60000);
    if (minutes < 0) return { text: "Overdue", isOverdue: true };
    return { text: formatMinutes(minutes), isOverdue: false };
  };

  // Ticket Detail Modal
  const TicketDetailModal = () => {
    if (!selectedTicket) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-500">{selectedTicket.ticket_number}</span>
              <h2 className="text-xl font-bold text-gray-900">{selectedTicket.title}</h2>
            </div>
            <button
              onClick={() => { setShowTicketModal(false); setSelectedTicket(null); }}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Status & Priority */}
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-sm text-gray-500">Status</label>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => {
                    updateTicketStatus(selectedTicket.id, e.target.value);
                    setSelectedTicket({ ...selectedTicket, status: e.target.value });
                  }}
                  className="mt-1 block w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="new">New</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="awaiting_customer">Awaiting Customer</option>
                  <option value="awaiting_internal">Awaiting Internal</option>
                  <option value="escalated">Escalated</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-500">Priority</label>
                <span className={`mt-1 block px-3 py-2 rounded-lg text-sm font-medium ${PRIORITY_COLORS[selectedTicket.priority]}`}>
                  {selectedTicket.priority.toUpperCase()}
                </span>
              </div>
              {selectedTicket.sla_breached && (
                <div className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg">
                  ⚠️ SLA Breached
                </div>
              )}
              {(selectedTicket.red_flag_score || 0) > 50 && (
                <div className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg">
                  🚩 Red Flag
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Submitted By</label>
                  <p className="font-medium">{selectedTicket.employee_name || "-"}</p>
                  <p className="text-sm text-gray-500">{selectedTicket.employee_email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Category</label>
                  <p className="font-medium">
                    {selectedTicket.feature?.icon} {selectedTicket.feature?.name || selectedTicket.category || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Created</label>
                  <p className="font-medium">{formatDate(selectedTicket.created_at)}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Assigned To</label>
                  <p className="font-medium">{selectedTicket.assignee_name || "Unassigned"}</p>
                  {selectedTicket.assigned_team && (
                    <p className="text-sm text-gray-500">{selectedTicket.assigned_team}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-500">Due Date</label>
                  <p className={`font-medium ${selectedTicket.sla_breached ? "text-red-600" : ""}`}>
                    {formatDate(selectedTicket.due_at)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">AI Sentiment</label>
                  <p className="font-medium capitalize">{selectedTicket.ai_sentiment || "Neutral"}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm text-gray-500">Description</label>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                {selectedTicket.description || "No description provided."}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => escalateTicket(selectedTicket.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                🚨 Escalate
              </button>
              <button
                onClick={() => router.push(`/admin/helpdesk/ticket/${selectedTicket.id}`)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Open Full View →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Stats Cards
  const StatsCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p className="text-sm text-gray-500">Total Tickets</p>
        <p className="text-2xl font-bold text-gray-900">{analytics?.total || 0}</p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p className="text-sm text-gray-500">Open</p>
        <p className="text-2xl font-bold text-yellow-600">
          {(analytics?.byStatus?.new || 0) + (analytics?.byStatus?.open || 0) + (analytics?.byStatus?.in_progress || 0)}
        </p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p className="text-sm text-gray-500">Escalated</p>
        <p className="text-2xl font-bold text-red-600">{analytics?.byStatus?.escalated || 0}</p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p className="text-sm text-gray-500">SLA Compliance</p>
        <p className={`text-2xl font-bold ${(analytics?.slaCompliance?.percentage || 100) >= 90 ? "text-green-600" : "text-orange-600"}`}>
          {analytics?.slaCompliance?.percentage || 100}%
        </p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p className="text-sm text-gray-500">Avg Response</p>
        <p className="text-2xl font-bold text-blue-600">{formatMinutes(analytics?.avgFirstResponseMinutes || 0)}</p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p className="text-sm text-gray-500">Red Flags</p>
        <p className="text-2xl font-bold text-red-600">{analytics?.redFlagCount || 0}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/admin/dashboard")}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  🎫 Helpdesk
                </h1>
                <p className="text-sm text-gray-500">Manage support tickets and SLAs</p>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
              {["tickets", "analytics", "settings"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <StatsCards />

        {activeTab === "tickets" && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="new">New</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="awaiting_customer">Awaiting Customer</option>
                  <option value="escalated">Escalated</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select
                  value={featureFilter}
                  onChange={(e) => setFeatureFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Categories</option>
                  {features.map((f) => (
                    <option key={f.id} value={f.id}>{f.icon} {f.name}</option>
                  ))}
                </select>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOverdue}
                    onChange={(e) => setShowOverdue(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Overdue Only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showRedFlags}
                    onChange={(e) => setShowRedFlags(e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">🚩 Red Flags</span>
                </label>
              </div>
            </div>

            {/* Tickets Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Ticket
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        SLA
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tickets.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                          No tickets found. Tickets submitted by employees will appear here.
                        </td>
                      </tr>
                    ) : (
                      tickets.map((ticket) => {
                        const timeRemaining = getTimeRemaining(ticket.due_at);
                        return (
                          <tr
                            key={ticket.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => { setSelectedTicket(ticket); setShowTicketModal(true); }}
                          >
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                {(ticket.red_flag_score || 0) > 50 && <span title="Red Flag">🚩</span>}
                                <div>
                                  <p className="font-medium text-gray-900 truncate max-w-[300px]">
                                    {ticket.title}
                                  </p>
                                  <p className="text-xs text-gray-500">{ticket.ticket_number}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-sm text-gray-900">{ticket.employee_name || "-"}</p>
                              <p className="text-xs text-gray-500">{ticket.employee_email}</p>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[ticket.status] || "bg-gray-100"}`}>
                                {ticket.status.replace(/_/g, " ")}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-bold rounded ${PRIORITY_COLORS[ticket.priority]}`}>
                                {ticket.priority.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              {ticket.sla_breached ? (
                                <span className="text-red-600 font-medium text-sm">⚠️ Breached</span>
                              ) : timeRemaining ? (
                                <span className={`text-sm ${timeRemaining.isOverdue ? "text-red-600 font-medium" : "text-gray-600"}`}>
                                  {timeRemaining.text}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {new Date(ticket.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => router.push(`/admin/helpdesk/ticket/${ticket.id}`)}
                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalTickets > limit && (
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalTickets)} of {totalTickets}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page * limit >= totalTickets}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Priority Distribution */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">By Priority</h3>
              <div className="grid grid-cols-4 gap-4">
                {["critical", "high", "medium", "low"].map((p) => (
                  <div key={p} className="text-center">
                    <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xl font-bold ${PRIORITY_COLORS[p]}`}>
                      {analytics?.byPriority?.[p] || 0}
                    </div>
                    <p className="mt-2 text-sm text-gray-600 capitalize">{p}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">By Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(analytics?.byStatus || {}).map(([status, count]) => (
                  <div key={status} className="p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500 capitalize">{status.replace(/_/g, " ")}</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SLA Performance */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">SLA Performance</h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-green-600">{analytics?.slaCompliance?.met || 0}</p>
                  <p className="text-sm text-gray-500">Met SLA</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-red-600">{analytics?.slaCompliance?.breached || 0}</p>
                  <p className="text-sm text-gray-500">Breached</p>
                </div>
                <div className="text-center">
                  <p className={`text-4xl font-bold ${(analytics?.slaCompliance?.percentage || 100) >= 90 ? "text-green-600" : "text-orange-600"}`}>
                    {analytics?.slaCompliance?.percentage || 100}%
                  </p>
                  <p className="text-sm text-gray-500">Compliance</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Features / Categories</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {features.map((feature) => (
                  <div key={feature.id} className="p-4 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors">
                    <div className="text-2xl mb-2">{feature.icon}</div>
                    <p className="font-medium text-gray-900">{feature.name}</p>
                    <p className="text-xs text-gray-500">{feature.key}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => router.push("/admin/helpdesk/sla-policies")}
                  className="p-4 text-left border border-gray-200 rounded-lg hover:border-indigo-300"
                >
                  <span className="text-xl">⏱️</span>
                  <p className="font-medium mt-2">SLA Policies</p>
                  <p className="text-sm text-gray-500">Configure response and resolution times</p>
                </button>
                <button
                  onClick={() => router.push("/admin/helpdesk/escalation-rules")}
                  className="p-4 text-left border border-gray-200 rounded-lg hover:border-indigo-300"
                >
                  <span className="text-xl">🚨</span>
                  <p className="font-medium mt-2">Escalation Rules</p>
                  <p className="text-sm text-gray-500">Configure automatic escalation triggers</p>
                </button>
                <button
                  onClick={() => router.push("/admin/helpdesk/queue-assignments")}
                  className="p-4 text-left border border-gray-200 rounded-lg hover:border-indigo-300"
                >
                  <span className="text-xl">📋</span>
                  <p className="font-medium mt-2">Queue Assignments</p>
                  <p className="text-sm text-gray-500">Configure auto-assignment rules</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {showTicketModal && <TicketDetailModal />}
    </div>
  );
}
