"use client";
import React from "react";
import AdminTopBar from "../components/AdminTopBar";

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <AdminTopBar title="Claims Administration" />
      <p style={{ color: "#4b5563" }}>
        Configure intimation and reimbursement workflows, integrations, and escalation matrix.
      </p>
    </div>
  );
}
