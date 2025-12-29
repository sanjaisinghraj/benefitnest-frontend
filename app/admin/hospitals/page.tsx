"use client";
import React from "react";
import AdminTopBar from "../components/AdminTopBar";

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <AdminTopBar title="Network Hospital Management" />
      <p style={{ color: "#4b5563" }}>
        Configure hospital data, filters, map integration, and blacklist sync.
      </p>
    </div>
  );
}
