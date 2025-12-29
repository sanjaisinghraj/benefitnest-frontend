"use client";
import React from "react";
import AdminTopBar from "../components/AdminTopBar";

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <AdminTopBar title="Loyalty Programs" />
      <p style={{ color: "#4b5563" }}>
        Configure employee and broker loyalty tiers and dashboards.
      </p>
    </div>
  );
}
