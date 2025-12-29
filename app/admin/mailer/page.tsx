"use client";
import React from "react";
import AdminTopBar from "../components/AdminTopBar";

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <AdminTopBar title="Mailer & Communications" />
      <p style={{ color: "#4b5563" }}>
        Configure reminders, alerts, templates, test sends, and delivery logs.
      </p>
    </div>
  );
}
