"use client";
import React from "react";
import AdminTopBar from "../components/AdminTopBar";

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <AdminTopBar title="Audit & Compliance" />
      <p style={{ color: "#4b5563" }}>
        Review audit logs, privacy policies, consent templates, and regulatory exports.
      </p>
    </div>
  );
}
