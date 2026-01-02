"use client";
import AdminTopBar from "../components/AdminTopBar";
import AdminFooter from "../components/AdminFooter";

export default function Page() {
  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", flexDirection: "column" }}>
      <AdminTopBar
        title="Broker & Insurer Panel"
        subtitle="Configure broker and insurer dashboards, access controls, and branding."
        icon={<span style={{ fontSize: 24 }}>🤝</span>}
        showBack={true}
      />
      <main style={{ flex: 1, width: "100%", maxWidth: 1400, margin: "0 auto", padding: 24 }}>
        {/* ...existing content... */}
      </main>
      <AdminFooter />
    </div>
  );
}
