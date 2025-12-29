"use client";
import React from "react";
import AdminTopBar from "../components/AdminTopBar";

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <AdminTopBar title="Recognition & Rewards" />
      <p style={{ color: "#4b5563" }}>
        Configure recognition wall, badges, points, vouchers, and analytics.
      </p>
    </div>
  );
}
