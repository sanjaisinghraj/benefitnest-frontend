"use client";
import React from "react";
import AdminTopBar from "../components/AdminTopBar";

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <AdminTopBar title="CSR & Volunteering" />
      <p style={{ color: "#4b5563" }}>
        Configure CSR initiatives, volunteering programs, donation matching, and impact tracking.
      </p>
    </div>
  );
}
