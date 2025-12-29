"use client";
import React from "react";
import AdminTopBar from "../components/AdminTopBar";

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <AdminTopBar title="Communities & Clubs" />
      <p style={{ color: "#4b5563" }}>
        Manage ERGs, hobby clubs, mentor-mentee matching, and wellness communities.
      </p>
    </div>
  );
}
