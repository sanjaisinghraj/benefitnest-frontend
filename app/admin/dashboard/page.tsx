"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://benefitnest-backend.onrender.com";

const AdminDashboard = () => {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [adminProfile, setAdminProfile] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    // Load admin profile from localStorage
    const token = localStorage.getItem("admin_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setAdminProfile({
          name: payload.name || payload.username || "Administrator",
          email: payload.email || "admin@benefitnest.space",
          role: payload.role || "Super Admin",
        });
      } catch {
        setAdminProfile({
          name: "Administrator",
          email: "admin@benefitnest.space",
          role: "Super Admin",
        });
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_token");
      document.cookie = "admin_token=; path=/; max-age=0";
      window.location.href = "https://www.benefitnest.space";
    }
  };

  const handleResetPassword = async () => {
    setPasswordError("");
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordError("All fields are required");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`${API_URL}/api/admin/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setPasswordSuccess(true);
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          setShowResetPasswordModal(false);
          setPasswordSuccess(false);
        }, 2000);
      } else {
        setPasswordError(data.message || "Failed to reset password");
      }
    } catch {
      setPasswordError("Failed to reset password. Please try again.");
    }
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const dashboardCards = [
    // 1. Tenant & Corporate Management
    {
      title: "Corporate Management",
      description:
        "Onboard corporates, configure subdomains, branding, organizational hierarchy (global → location), and relationship mapping.",
      icon: "🏢",
      link: "/admin/corporates",
      color: "#2563eb",
    },
    // 2. Master Data Management
    {
      title: "Master Data Management",
      description:
        "Configure insurers, TPAs, policy types, job grades, business units, cities, states, relationships, gender, and network hospital types.",
      icon: "⚙️",
      link: "/admin/masters",
      color: "#0ea5e9",
    },
    // 3. Portal Customization
    {
      title: "Portal Customization",
      description:
        "Design client portals with logos, colors, fonts, landing page tiles, login branding, and preview before publish (web + mobile).",
      icon: "🎨",
      link: "/admin/portal-customization",
      color: "#ec4899",
    },
    // 4. Employee & HR Management
    {
      title: "Employee & HR Management",
      description:
        "Bulk upload, edit, delete employees. Configure HR roles (Global, Country, Location HR), dependent mapping, and eligibility rules.",
      icon: "👥",
      link: "/admin/employees",
      color: "#10b981",
    },
    // 5. Policy & Product Setup
    {
      title: "Policy & Product Setup",
      description:
        "Configure GMC, GPA, GTL, OPD, parental, keyman, workmen comp, voluntary, top-up, riders. Manage SI slabs, premium matrix, and EMI options.",
      icon: "📋",
      link: "/admin/policies",
      color: "#f59e0b",
    },
    // 6. Enrollment Management
    {
      title: "Enrollment Management",
      description:
        "Control enrollment windows (inception, new joiners, special), grace periods, eligibility filters, trade-off logic, and wallet panel setup.",
      icon: "📝",
      link: "/admin/enrollment",
      color: "#8b5cf6",
    },
    // 7. Claims Administration
    {
      title: "Claims Administration",
      description:
        "Configure intimation, reimbursement workflows, TPA API/SSO integration, document rules, escalation matrix, and live status tracking.",
      icon: "📄",
      link: "/admin/claims",
      color: "#dc2626",
    },
    // 8. E-Card Management
    {
      title: "E-Card Management",
      description:
        "Manage e-card templates (template-based, API-based, upload-based), member/family downloads, alerts, daily sync, and failure reports.",
      icon: "💳",
      link: "/admin/ecards",
      color: "#06b6d4",
    },
    // 9. Network Hospital Management
    {
      title: "Network Hospital Management",
      description:
        "Configure hospital data via manual upload or API sync, filters by insurer/TPA/location, map integration (distance, ETA), blacklist sync.",
      icon: "🏥",
      link: "/admin/hospitals",
      color: "#059669",
    },
    // 10. Wellness & Financial Wellbeing
    {
      title: "Wellness & Wellbeing",
      description:
        "Health assessments, mental wellbeing, AI coaching, financial literacy, budget calculators, retirement tips, and wellness partner integrations.",
      icon: "🧘",
      link: "/admin/wellness",
      color: "#14b8a6",
    },
    // 11. Recognition, Rewards & Perks
    {
      title: "Recognition & Rewards",
      description:
        "Peer-to-peer recognition wall, manager badges, points system, meal cards, vouchers, travel perks, redemption catalog, and engagement analytics.",
      icon: "🏆",
      link: "/admin/rewards",
      color: "#f97316",
    },
    // 12. Sales Incentives & Gamification
    {
      title: "Sales Incentives",
      description:
        "Automated incentive programs for sales teams & brokers, leaderboards, gamified KPIs, contest creation, and mobile-first dashboards.",
      icon: "🎯",
      link: "/admin/incentives",
      color: "#ef4444",
    },
    // 13. Loyalty Programs
    {
      title: "Loyalty Programs",
      description:
        "Tiered loyalty for employees (Bronze/Silver/Gold), broker loyalty rewards for servicing & claims efficiency, insurer performance dashboards.",
      icon: "⭐",
      link: "/admin/loyalty",
      color: "#eab308",
    },
    // 14. Pulse Surveys & Feedback
    {
      title: "Surveys & Feedback",
      description:
        "Mood-o-meters, quick polls, anonymous feedback channels, AI sentiment analysis, and employee engagement analytics for HR.",
      icon: "📣",
      link: "/admin/surveys",
      color: "#a855f7",
    },
    // 15. Communities & Clubs
    {
      title: "Communities & Clubs",
      description:
        "Employee Resource Groups (ERGs), hobby clubs (fitness, books, travel), mentor-mentee matching, and gamified wellness communities.",
      icon: "👋",
      link: "/admin/communities",
      color: "#22c55e",
    },
    // 16. Learning & Development
    {
      title: "Learning & Development",
      description:
        "Micro-learning modules, insurance literacy, gamified skill challenges, compliance training, and LMS integrations (Workday, SAP, Darwinbox).",
      icon: "🎓",
      link: "/admin/learning",
      color: "#3b82f6",
    },
    // 17. CSR & Volunteering
    {
      title: "CSR & Volunteering",
      description:
        "Corporate Social Responsibility initiatives, employee volunteering programs, donation matching, impact tracking, and CSR dashboards.",
      icon: "💚",
      link: "/admin/csr",
      color: "#16a34a",
    },
    // 18. Marketplace Configuration
    {
      title: "Marketplace Settings",
      description:
        "Manage vendor onboarding, pricing tiers, catalog setup, API/SSO integrations, and corporate-specific visibility rules.",
      icon: "🛒",
      link: "/admin/marketplace-settings",
      color: "#7c3aed",
    },
    // 19. Reports, Analytics & AI Insights
    {
      title: "Reports & AI Insights",
      description:
        "Claims analytics, predictive attrition, fraud detection, personalized nudges, engagement metrics, compliance alerts. Export CSV, PDF, API.",
      icon: "📊",
      link: "/admin/reports",
      color: "#ec4899",
    },
    // 20. Audit & Compliance Logs
    {
      title: "Audit & Compliance",
      description:
        "Immutable audit logs, privacy policy, terms & disclaimers, consent templates, GDPR/HIPAA toggles, versioning, and regulatory exports.",
      icon: "⚖️",
      link: "/admin/audit",
      color: "#6366f1",
    },
    // 21. System Configuration
    {
      title: "System Configuration",
      description:
        "Configure email/SMS templates, notification preferences, API keys, SSO providers, and feature toggles per tenant.",
      icon: "🔧",
      link: "/admin/system",
      color: "#64748b",
    },
    // 22. Mailer & Communication Management
    {
      title: "Mailer & Communications",
      description:
        "Configure enrollment reminders, claim alerts, custom templates per tenant, test-send logs, and delivery status tracking.",
      icon: "📧",
      link: "/admin/mailer",
      color: "#0284c7",
    },
    // 23. Role & Permission Management
    {
      title: "Roles & Permissions",
      description:
        "Define module-level permissions, create roles (Admin, Broker, HR, Insurer), configure MFA, login expiry, and OTP rules.",
      icon: "🔐",
      link: "/admin/roles",
      color: "#9333ea",
    },
    // 24. Broker & Insurer Panel Setup
    {
      title: "Broker & Insurer Panel",
      description:
        "Enable broker dashboards for client servicing, insurer dashboards for policy/claims, controlled tenant access, partner branding.",
      icon: "🤝",
      link: "/admin/partners",
      color: "#0891b2",
    },
    // 25. Data Retention & Archival
    {
      title: "Data Retention",
      description:
        "Configure retention rules for claims, enrollments, logs. Set auto-archive logic and GDPR/HIPAA compliance toggles.",
      icon: "🗄️",
      link: "/admin/retention",
      color: "#78716c",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          backgroundColor: "white",
          borderBottom: "1px solid #e5e7eb",
          position: "sticky",
          top: 0,
          zIndex: 50,
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <img
                src="/images/marketing/logo.png"
                alt="BenefitNest"
                style={{
                  height: "40px",
                  objectFit: "contain",
                }}
              />
            </div>
          </div>

          {/* Right Side - Profile and Logout */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* User Profile Dropdown */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  backgroundColor: "#f3f4f6",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                <span style={{ fontSize: "20px" }}>👤</span>
                <span>Admin</span>
                <span style={{ fontSize: "12px" }}>▼</span>
              </button>

              {showProfileMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "8px",
                    backgroundColor: "white",
                    borderRadius: "8px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                    border: "1px solid #e5e7eb",
                    minWidth: "180px",
                    zIndex: 100,
                  }}
                >
                  <div
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#111827",
                      }}
                    >
                      {adminProfile?.name || "Administrator"}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      {adminProfile?.email || "admin@benefitnest.space"}
                    </div>
                  </div>
                  <div style={{ padding: "8px" }}>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowProfileModal(true);
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        textAlign: "left",
                        backgroundColor: "transparent",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                        color: "#374151",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f3f4f6")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <span>👤</span> My Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowResetPasswordModal(true);
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        textAlign: "left",
                        backgroundColor: "transparent",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                        color: "#374151",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f3f4f6")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <span>🔒</span> Reset Password
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                padding: "10px 20px",
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                transition: "all 0.2s",
                boxShadow: "0 1px 3px rgba(239, 68, 68, 0.3)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#dc2626";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#ef4444";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 24px" }}
      >
        {/* Page Title */}
        <div style={{ marginBottom: "40px" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            Admin Dashboard
          </h1>
          <p style={{ color: "#6b7280", fontSize: "16px" }}>
            Manage your platform settings and configurations
          </p>
        </div>

        {/* Dashboard Cards Grid - 4 per row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "24px",
          }}
        >
          {dashboardCards.map((card, index) => (
            <div
              key={index}
              onClick={() => navigateTo(card.link)}
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "24px",
                cursor: "pointer",
                transition: "all 0.2s",
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 10px 25px -5px rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.borderColor = card.color;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.borderColor = "#e5e7eb";
              }}
            >
              {/* Top Color Bar */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  backgroundColor: card.color,
                }}
              ></div>

              {/* Icon */}
              <div
                style={{
                  fontSize: "36px",
                  marginBottom: "16px",
                }}
              >
                {card.icon}
              </div>

              {/* Title */}
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: "8px",
                }}
              >
                {card.title}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  lineHeight: "1.5",
                  marginBottom: "16px",
                }}
              >
                {card.description}
              </p>

              {/* Arrow Link */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: card.color,
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                <span>Manage {card.title.toLowerCase()}</span>
                <span style={{ fontSize: "16px" }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          marginTop: "auto",
          padding: "20px 24px",
          backgroundColor: "white",
          borderTop: "1px solid #e5e7eb",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>
          © {new Date().getFullYear()} BenefitNest. All rights reserved.
        </p>
        <p style={{ fontSize: "12px", color: "#9ca3af" }}>
          Developed by Sanjai & Aaryam
        </p>
      </footer>

      {/* Click outside to close profile menu */}
      {showProfileMenu && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 40 }}
          onClick={() => setShowProfileMenu(false)}
        />
      )}

      {/* My Profile Modal */}
      {showProfileModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
          onClick={() => setShowProfileModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "450px",
              width: "90%",
              boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "#111827",
                  margin: 0,
                }}
              >
                My Profile
              </h2>
              <button
                onClick={() => setShowProfileModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#6b7280",
                }}
              >
                ×
              </button>
            </div>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #2563eb 0%, #10b981 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  fontSize: "48px",
                  color: "white",
                }}
              >
                {adminProfile?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#111827",
                  margin: "0 0 4px 0",
                }}
              >
                {adminProfile?.name || "Administrator"}
              </h3>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                {adminProfile?.role || "Super Admin"}
              </p>
            </div>
            <div
              style={{
                background: "#f9fafb",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Email Address
                </label>
                <p
                  style={{
                    fontSize: "15px",
                    color: "#111827",
                    margin: "4px 0 0 0",
                  }}
                >
                  {adminProfile?.email || "admin@benefitnest.space"}
                </p>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Role
                </label>
                <p
                  style={{
                    fontSize: "15px",
                    color: "#111827",
                    margin: "4px 0 0 0",
                  }}
                >
                  {adminProfile?.role || "Super Admin"}
                </p>
              </div>
              <div>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Account Status
                </label>
                <p
                  style={{
                    fontSize: "15px",
                    color: "#10b981",
                    margin: "4px 0 0 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "#10b981",
                    }}
                  ></span>{" "}
                  Active
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowProfileModal(false)}
              style={{
                width: "100%",
                marginTop: "24px",
                padding: "14px",
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
          onClick={() => setShowResetPasswordModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "450px",
              width: "90%",
              boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "#111827",
                  margin: 0,
                }}
              >
                Reset Password
              </h2>
              <button
                onClick={() => setShowResetPasswordModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#6b7280",
                }}
              >
                ×
              </button>
            </div>
            {passwordSuccess ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: "64px", marginBottom: "16px" }}>✅</div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#10b981",
                    margin: "0 0 8px 0",
                  }}
                >
                  Password Updated!
                </h3>
                <p style={{ fontSize: "14px", color: "#6b7280" }}>
                  Your password has been changed successfully.
                </p>
              </div>
            ) : (
              <>
                {passwordError && (
                  <div
                    style={{
                      padding: "12px 16px",
                      backgroundColor: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: "8px",
                      marginBottom: "20px",
                      color: "#dc2626",
                      fontSize: "14px",
                    }}
                  >
                    {passwordError}
                  </div>
                )}
                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "8px",
                    }}
                  >
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "15px",
                      boxSizing: "border-box",
                    }}
                    placeholder="Enter current password"
                  />
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "8px",
                    }}
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "15px",
                      boxSizing: "border-box",
                    }}
                    placeholder="Enter new password (min 8 characters)"
                  />
                </div>
                <div style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "8px",
                    }}
                  >
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "15px",
                      boxSizing: "border-box",
                    }}
                    placeholder="Confirm new password"
                  />
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={() => setShowResetPasswordModal(false)}
                    style={{
                      flex: 1,
                      padding: "14px",
                      backgroundColor: "#f3f4f6",
                      color: "#374151",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "15px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetPassword}
                    style={{
                      flex: 1,
                      padding: "14px",
                      backgroundColor: "#2563eb",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "15px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Update Password
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
