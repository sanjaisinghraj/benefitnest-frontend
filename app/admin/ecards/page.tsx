"use client";
import React from "react";
import AdminTopBar from "../components/AdminTopBar";

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <AdminTopBar title="E-Card Management" />
      <p style={{ color: "#4b5563" }}>
        Manage e-card templates, downloads, alerts, syncs, and failure reports.
      </p>
    </div>
  );
}
