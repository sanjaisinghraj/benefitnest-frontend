"use client";
import AdminTopBar from "../components/AdminTopBar";
import AdminFooter from "../components/AdminFooter";

export default function Page() {
  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", flexDirection: "column" }}>
      <AdminTopBar
        title="Communities & Clubs"
        subtitle="Manage ERGs, hobby clubs, mentor-mentee matching, and wellness communities."
        icon={<span style={{ fontSize: 24 }}>👋</span>}
        showBack={true}
      />
      <main style={{ flex: 1, width: "100%", maxWidth: 1400, margin: "0 auto", padding: 24 }}>
        {/* ...existing content... */}
      </main>
      <AdminFooter />
    </div>
  );
}
