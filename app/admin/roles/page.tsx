"use client";
import React from "react";
import AdminTopBar from "../components/AdminTopBar";

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <AdminTopBar title="Roles & Permissions" />
      <p style={{ color: "#4b5563" }}>
        Manage roles, module permissions, MFA, login expiry, and OTP rules.
      </p>
    </div>
  );
}
