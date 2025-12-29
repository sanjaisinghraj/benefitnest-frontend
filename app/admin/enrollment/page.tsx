"use client";
import React from "react";
import AdminTopBar from "../components/AdminTopBar";

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <AdminTopBar title="Enrollment Management" />
      <p style={{ color: "#4b5563" }}>
        Configure enrollment windows, grace periods, filters, trade-offs, and wallet panel.
      </p>
    </div>
  );
}
