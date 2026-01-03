"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://benefitnest-backend.onrender.com";

interface Feature {
  id: string;
  key: string;
  name: string;
  icon: string;
  description?: string;
  form_schema?: FormField[];
  categories?: string[];
}

interface FormField {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "file" | "date" | "email" | "phone";
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  status: string;
  priority: string;
  category?: string;
  created_at: string;
  updated_at: string;
  feature?: { name: string; icon: string };
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: "Submitted", color: "bg-blue-100 text-blue-700" },
  open: { label: "Being Reviewed", color: "bg-yellow-100 text-yellow-700" },
  in_progress: { label: "In Progress", color: "bg-purple-100 text-purple-700" },
  awaiting_customer: { label: "We Need Your Input", color: "bg-orange-100 text-orange-700" },
  awaiting_internal: { label: "In Progress", color: "bg-indigo-100 text-indigo-700" },
  escalated: { label: "Escalated", color: "bg-red-100 text-red-700" },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-700" },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-600" },
  reopened: { label: "Reopened", color: "bg-pink-100 text-pink-700" },
};

export default function EmployeeHelpdeskPage() {
  const router = useRouter();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // View state
  const [activeTab, setActiveTab] = useState<"home" | "my-tickets">("home");

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

  // Fetch employee's tickets
  const fetchTickets = async () => {
    try {
      const response = await fetch(`${API_URL}/api/helpdesk/employee/tickets`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        setTickets(data.data);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchFeatures(), fetchTickets()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Submit new ticket
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeature) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/helpdesk/employee/tickets`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          featureId: selectedFeature.id,
          featureKey: selectedFeature.key,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          formData: formData,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSubmitSuccess(true);
        setFormData({});
        fetchTickets();
        setTimeout(() => {
          setShowNewTicketModal(false);
          setSubmitSuccess(false);
          setSelectedFeature(null);
        }, 2000);
      } else {
        alert(data.message || "Failed to submit ticket");
      }
    } catch (error) {
      console.error("Error submitting ticket:", error);
      alert("Failed to submit ticket. Please try again.");
    }
    setSubmitting(false);
  };

  // Feature Card Component
  const FeatureCard = ({ feature }: { feature: Feature }) => (
    <button
      onClick={() => {
        setSelectedFeature(feature);
        setFormData({});
        setShowNewTicketModal(true);
      }}
      className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all text-left group"
    >
      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{feature.icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{feature.name}</h3>
      <p className="text-sm text-gray-500">{feature.description || `Get help with ${feature.name.toLowerCase()}`}</p>
    </button>
  );

  // Ticket Row Component
  const TicketRow = ({ ticket }: { ticket: Ticket }) => {
    const statusInfo = STATUS_LABELS[ticket.status] || { label: ticket.status, color: "bg-gray-100" };
    const needsAction = ticket.status === "awaiting_customer";

    return (
      <div
        onClick={() => router.push(`/portal/helpdesk/ticket/${ticket.id}`)}
        className={`p-4 bg-white rounded-xl border cursor-pointer transition-all hover:shadow-md ${
          needsAction ? "border-orange-300 bg-orange-50/30" : "border-gray-200"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {needsAction && <span className="text-orange-500">⚠️</span>}
              <span className="text-xs text-gray-400">{ticket.ticket_number}</span>
            </div>
            <h4 className="font-medium text-gray-900 truncate">{ticket.title}</h4>
            <div className="flex items-center gap-2 mt-2">
              {ticket.feature && (
                <span className="text-sm text-gray-500">
                  {ticket.feature.icon} {ticket.feature.name}
                </span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(ticket.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // New Ticket Modal
  const NewTicketModal = () => {
    if (!selectedFeature) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {submitSuccess ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ticket Submitted!</h3>
              <p className="text-gray-500">
                We've received your request. You'll get updates via email and in your tickets list.
              </p>
            </div>
          ) : (
            <>
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedFeature.icon}</span>
                  <h2 className="text-lg font-bold text-gray-900">{selectedFeature.name}</h2>
                </div>
                <button
                  onClick={() => { setShowNewTicketModal(false); setSelectedFeature(null); }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitTicket} className="p-6 space-y-5">
                {/* Category Select (if available) */}
                {selectedFeature.categories && selectedFeature.categories.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      What do you need help with? *
                    </label>
                    <select
                      required
                      value={formData.category || ""}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select an option...</option>
                      {selectedFeature.categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Brief summary of your issue"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Please provide as much detail as possible..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  />
                </div>

                {/* Dynamic Form Fields */}
                {selectedFeature.form_schema?.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label} {field.required && "*"}
                    </label>
                    {field.type === "select" ? (
                      <select
                        required={field.required}
                        value={formData[field.key] || ""}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select...</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea
                        required={field.required}
                        rows={3}
                        value={formData[field.key] || ""}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
                      />
                    ) : (
                      <input
                        type={field.type}
                        required={field.required}
                        value={formData[field.key] || ""}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    )}
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  // Count tickets needing action
  const needsActionCount = tickets.filter((t) => t.status === "awaiting_customer").length;
  const openCount = tickets.filter((t) => !["resolved", "closed"].includes(t.status)).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/portal")}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ←
              </button>
              <h1 className="text-xl font-bold text-gray-900">Help Center</h1>
            </div>
            
            {/* Tab Toggle */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("home")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "home"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Get Help
              </button>
              <button
                onClick={() => setActiveTab("my-tickets")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === "my-tickets"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                My Tickets
                {openCount > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    needsActionCount > 0 ? "bg-orange-100 text-orange-700" : "bg-gray-200 text-gray-600"
                  }`}>
                    {openCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === "home" ? (
          <>
            {/* Hero Section */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">How can we help?</h2>
              <p className="text-gray-600">Select a topic below or search for your issue</p>
            </div>

            {/* Needs Action Alert */}
            {needsActionCount > 0 && (
              <div
                onClick={() => setActiveTab("my-tickets")}
                className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between cursor-pointer hover:bg-orange-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="font-medium text-orange-800">Action Required</p>
                    <p className="text-sm text-orange-600">
                      {needsActionCount} ticket{needsActionCount > 1 ? "s" : ""} need your response
                    </p>
                  </div>
                </div>
                <span className="text-orange-600">→</span>
              </div>
            )}

            {/* Feature Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {features.map((feature) => (
                <FeatureCard key={feature.id} feature={feature} />
              ))}
            </div>

            {/* Recent Tickets Preview */}
            {tickets.length > 0 && (
              <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Tickets</h3>
                  <button
                    onClick={() => setActiveTab("my-tickets")}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    View All →
                  </button>
                </div>
                <div className="space-y-3">
                  {tickets.slice(0, 3).map((ticket) => (
                    <TicketRow key={ticket.id} ticket={ticket} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* My Tickets Tab */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Tickets</h2>
              <button
                onClick={() => setActiveTab("home")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
              >
                + New Request
              </button>
            </div>

            {tickets.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets yet</h3>
                <p className="text-gray-500 mb-6">When you submit a help request, it will appear here.</p>
                <button
                  onClick={() => setActiveTab("home")}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Get Help
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Needs Action Section */}
                {needsActionCount > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-orange-700 mb-3 flex items-center gap-2">
                      ⚠️ Needs Your Response ({needsActionCount})
                    </h4>
                    {tickets
                      .filter((t) => t.status === "awaiting_customer")
                      .map((ticket) => (
                        <TicketRow key={ticket.id} ticket={ticket} />
                      ))}
                  </div>
                )}

                {/* Other Tickets */}
                {tickets
                  .filter((t) => t.status !== "awaiting_customer")
                  .map((ticket) => (
                    <TicketRow key={ticket.id} ticket={ticket} />
                  ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && <NewTicketModal />}
    </div>
  );
}
