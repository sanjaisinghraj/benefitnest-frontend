"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  showBack?: boolean;
  actions?: React.ReactNode;
};


export default function AdminTopBar({ title, subtitle, icon, showBack = true, actions }: Props) {
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

  React.useEffect(() => {
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

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://benefitnest-backend.onrender.com";

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
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
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

  return (
    <header
      style={{
        backgroundColor: "white",
        borderBottom: "1px solid #e5e7eb",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "12px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src="/images/marketing/logo.png"
              alt="BenefitNest"
              style={{ height: "40px", objectFit: "contain" }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          {showBack && (
            <button
              onClick={() => router.push("/admin/dashboard")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#374151",
                backgroundColor: "#f3f4f6",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                padding: "8px 12px",
              }}
            >
              ← Dashboard
            </button>
          )}
          {title && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {icon && <span style={{ fontSize: "20px" }}>{icon}</span>}
              <div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#111827" }}>{title}</div>
                {subtitle && (
                  <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                    {subtitle}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {actions}
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
                fontWeight: 500,
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
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
                    Administrator
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>admin@benefitnest.space</div>
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
                  >
                    <span>🔒</span> Reset Password
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Logout
          </button>
        </div>
      </div>

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

      {showResetPasswordModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "20px",
              width: "360px",
            }}
          >
            <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}>
              Reset Password
            </div>
            <div style={{ display: "grid", gap: "10px" }}>
              <input
                type="password"
                placeholder="Current Password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                style={{
                  padding: "10px 12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <input
                type="password"
                placeholder="New Password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                style={{
                  padding: "10px 12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                style={{
                  padding: "10px 12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              {passwordError && (
                <div style={{ color: "#ef4444", fontSize: "12px" }}>{passwordError}</div>
              )}
              {passwordSuccess && (
                <div style={{ color: "#16a34a", fontSize: "12px" }}>Password changed</div>
              )}
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "12px", justifyContent: "end" }}>
              <button
                onClick={() => setShowResetPasswordModal(false)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#2563eb",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
