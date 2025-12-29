"use client";
import React from "react";
import AdminTopBar from "../components/AdminTopBar";

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <AdminTopBar title="Data Retention" />
      <p style={{ color: "#4b5563" }}>
        Configure retention rules, archival logic, and compliance toggles.
      </p>
    </div>
  );
}
