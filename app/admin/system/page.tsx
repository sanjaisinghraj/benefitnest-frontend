"use client";
import React from "react";
import AdminTopBar from "../components/AdminTopBar";

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <AdminTopBar title="System Configuration" />
      <p style={{ color: "#4b5563" }}>
        Configure notifications, API keys, SSO providers, and feature toggles.
      </p>
    </div>
  );
}
