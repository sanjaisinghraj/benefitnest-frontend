"use client";
import React from "react";
import AdminTopBar from "../components/AdminTopBar";

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <AdminTopBar title="Sales Incentives" />
      <p style={{ color: "#4b5563" }}>
        Configure incentives, leaderboards, contests, and mobile-first dashboards.
      </p>
    </div>
  );
}
