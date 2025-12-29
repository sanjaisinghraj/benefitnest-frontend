"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button
          onClick={() => router.push("/admin/dashboard")}
          style={{
            background: "#f3f4f6",
            border: "none",
            padding: "8px 12px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          ← Dashboard
        </button>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Learning & Development</h1>
      </div>
      <p style={{ color: "#4b5563" }}>
        Manage micro-learning modules, training, and LMS integrations.
      </p>
    </div>
  );
}
