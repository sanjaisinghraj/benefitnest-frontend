"use client";
import React from "react";
import AdminTopBar from "../components/AdminTopBar";

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <AdminTopBar title="Learning & Development" />
      <p style={{ color: "#4b5563" }}>
        Manage micro-learning modules, training, and LMS integrations.
      </p>
    </div>
  );
}
