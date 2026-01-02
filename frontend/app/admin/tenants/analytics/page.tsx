import TenantAnalyticsClient from "./TenantAnalyticsClient";
import AdminTopBar from "../../components/AdminTopBar";
import AdminFooter from "../../components/AdminFooter";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", flexDirection: "column" }}>
      <AdminTopBar
        title="Tenant Analytics"
        subtitle="View analytics and reports for tenants."
        icon={<span style={{ fontSize: 24 }}>📈</span>}
        showBack={true}
      />
      <main style={{ flex: 1, width: "100%", maxWidth: 1400, margin: "0 auto", padding: 24 }}>
        <TenantAnalyticsClient />
      </main>
      <AdminFooter />
    </div>
  );
}
