import RolloutClient from "./RolloutClient";
import AdminTopBar from "../components/AdminTopBar";
import AdminFooter from "../components/AdminFooter";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", flexDirection: "column" }}>
      <AdminTopBar
        title="Feature Rollout Management"
        subtitle="Manage feature flags, rollouts, and experiments across tenants."
        icon={<span style={{ fontSize: 24 }}>🚦</span>}
        showBack={true}
      />
      <main style={{ flex: 1, width: "100%", maxWidth: 1400, margin: "0 auto", padding: 24 }}>
        <RolloutClient />
      </main>
      <AdminFooter />
    </div>
  );
}
