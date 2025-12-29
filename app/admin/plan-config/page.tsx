 "use client";
import React from "react";
import PlanConfigClient from "./PlanConfigClient";
import AdminTopBar from "../components/AdminTopBar";
import AdminFooter from "../components/AdminFooter";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9fafb",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AdminTopBar
        title="Benefit Plan Configuration"
        subtitle="Create and configure employer benefit policies per tenant"
        icon={<span style={{ fontSize: 24 }}>⚙️</span>}
        showBack={true}
      />
      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 1400,
          margin: "0 auto",
          padding: 24,
        }}
      >
        <PlanConfigClient />
      </main>
      <AdminFooter />
    </div>
  );
}
