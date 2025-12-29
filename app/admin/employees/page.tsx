"use client";
import React from "react";
import AdminTopBar from "../components/AdminTopBar";

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <AdminTopBar title="Employee & HR Management" />
      <p style={{ color: "#4b5563" }}>
        Manage employees, HR roles, dependent mapping, and eligibility rules.
      </p>
    </div>
  );
}
