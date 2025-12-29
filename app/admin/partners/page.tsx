"use client";
import React from "react";
import AdminTopBar from "../components/AdminTopBar";

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <AdminTopBar title="Broker & Insurer Panel" />
      <p style={{ color: "#4b5563" }}>
        Configure broker and insurer dashboards, access controls, and branding.
      </p>
    </div>
  );
}
