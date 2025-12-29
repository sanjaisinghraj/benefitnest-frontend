"use client";
import React from "react";
import AdminTopBar from "../components/AdminTopBar";

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <AdminTopBar title="Surveys & Feedback" />
      <p style={{ color: "#4b5563" }}>
        Manage polls, feedback channels, sentiment analysis, and engagement analytics.
      </p>
    </div>
  );
}
