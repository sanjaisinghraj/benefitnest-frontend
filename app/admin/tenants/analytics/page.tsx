"use client";
import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { gql, useApolloClient } from "@apollo/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { gql, useApolloClient } from "@apollo/client";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28BFE", "#FF6699"];

export default function TenantAnalyticsPage() {
  const { user, token } = useSession();
  const client = useApolloClient();
  const [tenants, setTenants] = useState<any[]>([]);
  const [facts, setFacts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [tenantId, setTenantId] = useState("");
  const [country, setCountry] = useState("");
  const [planType, setPlanType] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [loading, setLoading] = useState(false);
  const [branding, setBranding] = useState<any>({});
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isCorporateAdmin, setIsCorporateAdmin] = useState(false);
  const [featureFlags, setFeatureFlags] = useState<any>({});
  const [selectedTenant, setSelectedTenant] = useState<string>("");
  const [flagMessage, setFlagMessage] = useState("");
  const [exportHistory, setExportHistory] = useState<any[]>([]);
  const client = useApolloClient();

  useEffect(() => {
    setIsSuperAdmin(user?.roles?.includes("super-admin"));
    setIsCorporateAdmin(user?.roles?.includes("corporate-admin"));
    setBranding({ font: "Inter, sans-serif", background: "#fff", color: "#222" });
    fetchTenants();
    // eslint-disable-next-line
  }, [user]);

  const fetchTenants = async () => {
    setLoading(true);
    const res = await client.query({
      query: gql`
        query TenantList {
          tenantList { id name country_code compliance_flags status }
        }
      `,
      fetchPolicy: "network-only"
    });
    setTenants(res.data.tenantList || []);
    if (res.data.tenantList?.length && (isSuperAdmin || isCorporateAdmin)) {
      const tid = isSuperAdmin ? "" : user?.tenantId;
      fetchFeatureFlags(tid || res.data.tenantList[0].id);
    }

      const fetchFeatureFlags = async (tenantId: string) => {
        if (!tenantId) return;
        setSelectedTenant(tenantId);
        const res = await client.query({
          query: gql`
            query FeatureFlagStatus($tenantId: String!) {
              featureFlagStatus(tenantId: $tenantId) { module enabled }
            }
          `,
          variables: { tenantId },
          fetchPolicy: "network-only"
        });
        setFeatureFlags(res.data.featureFlagStatus.reduce((acc: any, f: any) => { acc[f.module] = f.enabled; return acc; }, {}));
        fetchExportHistory(tenantId);
      };

      const handleFlagToggle = async (module: string, enabled: boolean) => {
        const mutation = enabled ? "enableFeatureFlag" : "disableFeatureFlag";
        await client.mutate({
          mutation: gql`
            mutation ToggleFlag($tenantId: String!, $module: String!) {
              ${mutation}(tenantId: $tenantId, module: $module) { module enabled }
            }
          `,
          variables: { tenantId: selectedTenant, module }
        });
        setFlagMessage(`Feature flag for ${module} ${enabled ? "enabled" : "disabled"}.`);
        fetchFeatureFlags(selectedTenant);
      };

      const fetchExportHistory = async (tenantId: string) => {
        if (!tenantId) return;
        const res = await client.query({
          query: gql`
            query ExportHistory($tenantId: String!) {
              exportHistory(tenantId: $tenantId) { event payload_json ts }
            }
          `,
          variables: { tenantId },
          fetchPolicy: "network-only"
        });
        setExportHistory(res.data.exportHistory || []);
      };

      const handleExport = (type: string) => {
        // Prepare data for export
        const exportData = facts.map(f => ({ ...f, tenant: tenants.find(t => t.id === f.corporateId)?.name || f.corporateId }));
        if (type === "csv") {
          const csv = [Object.keys(exportData[0] || {}).join(",")].concat(exportData.map(row => Object.values(row).join(","))).join("\n");
          const blob = new Blob([csv], { type: "text/csv" });
          saveAs(blob, "tenant-analytics.csv");
        } else if (type === "xlsx") {
          const ws = XLSX.utils.json_to_sheet(exportData);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Analytics");
          XLSX.writeFile(wb, "tenant-analytics.xlsx");
        } else if (type === "pdf") {
          const doc = new jsPDF();
          doc.text("Tenant Analytics Export", 10, 10);
          doc.text(JSON.stringify(exportData, null, 2), 10, 20);
          doc.save("tenant-analytics.pdf");
        }
        // Log export to backend
        client.mutate({
          mutation: gql`
            mutation LogExport($tenantId: String!, $format: String!, $filters: String!) {
              logExport(tenantId: $tenantId, format: $format, filters: $filters) { event ts }
            }
          `,
          variables: { tenantId: selectedTenant, format: type, filters: JSON.stringify({ country, planType, dateRange }) }
        });
        fetchExportHistory(selectedTenant);
      };

      const handleExport = (type: string) => {
        // Prepare data for export
        const exportData = facts.map(f => ({ ...f, tenant: tenants.find(t => t.id === f.corporateId)?.name || f.corporateId }));
        if (type === "csv") {
          const csv = [Object.keys(exportData[0] || {}).join(",")].concat(exportData.map(row => Object.values(row).join(","))).join("\n");
          const blob = new Blob([csv], { type: "text/csv" });
          saveAs(blob, "tenant-analytics.csv");
        } else if (type === "xlsx") {
          const ws = XLSX.utils.json_to_sheet(exportData);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Analytics");
          XLSX.writeFile(wb, "tenant-analytics.xlsx");
        } else if (type === "pdf") {
          const doc = new jsPDF();
          doc.text("Tenant Analytics Export", 10, 10);
          doc.text(JSON.stringify(exportData, null, 2), 10, 20);
          doc.save("tenant-analytics.pdf");
        }
        // Log export to ClickHouse (assume backend logs on export)
      };
    setLoading(false);
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    const res1 = await client.query({
      query: gql`
        query PlanActionFacts($tenantId: String, $country: String, $planType: String, $from: String, $to: String) {
          getPlanActionFacts(corporateId: $tenantId, country: $country, planType: $planType, from: $from, to: $to) {
            corporateId planType actionType premium walletUsage ts
          }
        }
      `,
      variables: { tenantId, country, planType, from: dateRange.from, to: dateRange.to },
      fetchPolicy: "network-only"
    });
    const res2 = await client.query({
      query: gql`
        query AnalyticsEvents($tenantId: String, $country: String, $planType: String, $from: String, $to: String) {
          getAnalyticsEvents(corporateId: $tenantId, country: $country, planType: $planType, from: $from, to: $to) {
            event payload_json ts
          }
        }
      `,
      variables: { tenantId, country, planType, from: dateRange.from, to: dateRange.to },
      fetchPolicy: "network-only"
    });
    setFacts(res1.data.getPlanActionFacts || []);
    setEvents(res2.data.getAnalyticsEvents || []);
    setLoading(false);
  };

  useEffect(() => {
    if (token && isSuperAdmin) fetchAnalytics();
    // eslint-disable-next-line
  }, [tenantId, country, planType, dateRange, token, isSuperAdmin]);

  // Aggregations
  const activeTenants = tenants.filter(t => t.status === "active").length;
  const inactiveTenants = tenants.filter(t => t.status !== "active").length;
  const adoptionData = [
    { name: "Active", value: activeTenants },
    { name: "Inactive", value: inactiveTenants }
  ];

  const enrollmentRates = facts.filter(f => f.actionType === "enrollment").reduce((acc, f) => {
    acc[f.planType] = (acc[f.planType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const premiumTotals = facts.reduce((acc, f) => acc + (f.premium || 0), 0);
  const walletTotals = facts.reduce((acc, f) => acc + (f.walletUsage || 0), 0);

  // Compliance by country
  const complianceByCountry = tenants.reduce((acc, t) => {
    const key = t.country_code;
    acc[key] = acc[key] || { GDPR: 0, HIPAA: 0, IRDAI: 0, total: 0 };
    if (t.compliance_flags?.includes("GDPR")) acc[key].GDPR++;
    if (t.compliance_flags?.includes("HIPAA")) acc[key].HIPAA++;
    if (t.compliance_flags?.includes("IRDAI")) acc[key].IRDAI++;
    acc[key].total++;
    return acc;
  }, {} as Record<string, { GDPR: number; HIPAA: number; IRDAI: number; total: number }>);

  if (!isSuperAdmin && !isCorporateAdmin) return <div style={{ padding: 32 }}>Access denied.</div>;

  return (
    <div style={{ fontFamily: branding.font, background: branding.background, color: branding.color, minHeight: '100vh', padding: 32 }}>
      <h1>Tenant Analytics Dashboard</h1>
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => handleExport("csv")}>Export CSV</button>
        <button onClick={() => handleExport("xlsx")} style={{ marginLeft: 8 }}>Export XLSX</button>
        <button onClick={() => handleExport("pdf")} style={{ marginLeft: 8 }}>Export PDF</button>
      </div>
      {(isSuperAdmin || isCorporateAdmin) && (
        <FeatureFlagsPanel
          tenantId={selectedTenant}
          featureFlags={featureFlags}
          onToggle={handleFlagToggle}
          isSuperAdmin={isSuperAdmin}
          isCorporateAdmin={isCorporateAdmin}
        />
      )}
      {flagMessage && <div style={{ color: "green", marginBottom: 8 }}>{flagMessage}</div>}
      <ExportHistoryTable exportHistory={exportHistory} tenantId={selectedTenant} />
      // FeatureFlagsPanel component (unchanged)
      // ExportHistoryTable component
      function ExportHistoryTable({ exportHistory, tenantId }: any) {
        if (!exportHistory?.length) return null;
        return (
          <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 16, marginTop: 24 }}>
            <h3>Export History</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Format</th>
                  <th>Filters</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {exportHistory.map((log: any, idx: number) => {
                  const payload = JSON.parse(log.payload_json || '{}');
                  return (
                    <tr key={idx}>
                      <td>{new Date(log.ts).toLocaleString()}</td>
                      <td>{payload.format}</td>
                      <td>{JSON.stringify(payload.filters)}</td>
                      <td>{payload.user || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }
      // FeatureFlagsPanel component
      function FeatureFlagsPanel({ tenantId, featureFlags, onToggle, isSuperAdmin, isCorporateAdmin }: any) {
        const modules = ["GMC", "GPA", "GTL", "Flex", "Wallet", "Wellness", "Custom"];
        return (
          <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 16, marginBottom: 24 }}>
            <h3>Feature Flags</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Enabled</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {modules.map(m => (
                  <tr key={m}>
                    <td>{m}</td>
                    <td>{featureFlags[m] ? "Yes" : "No"}</td>
                    <td>
                      {(isSuperAdmin || isCorporateAdmin) && (
                        <button onClick={() => onToggle(m, !featureFlags[m])}>
                          {featureFlags[m] ? "Disable" : "Enable"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <input placeholder="Tenant ID" value={tenantId} onChange={e => setTenantId(e.target.value)} />
        <input placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} />
        <input placeholder="Plan Type" value={planType} onChange={e => setPlanType(e.target.value)} />
        <input type="date" value={dateRange.from} onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))} />
        <input type="date" value={dateRange.to} onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))} />
        <button onClick={fetchAnalytics} disabled={loading}>Refresh</button>
      </div>
      {loading ? <div>Loading...</div> : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
          <div style={{ flex: 1, minWidth: 350 }}>
            <h3>Tenant Adoption</h3>
            <PieChart width={250} height={250}>
              <Pie data={adoptionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {adoptionData.map((entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
            <div style={{ fontWeight: 600, marginTop: 8 }}>Active: {activeTenants} | Inactive: {inactiveTenants}</div>
          </div>
          <div style={{ flex: 1, minWidth: 350 }}>
            <h3>Enrollment Rates by Plan</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={Object.entries(enrollmentRates).map(([plan, count]) => ({ plan, count }))}>
                <XAxis dataKey="plan" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: 1, minWidth: 350 }}>
            <h3>Premium Totals</h3>
            <PieChart width={250} height={250}>
              <Pie data={[{ name: 'Premium', value: premiumTotals }]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#00C49F">
                <Cell key="cell-0" fill="#00C49F" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
            <div style={{ fontWeight: 600, marginTop: 8 }}>Total: ₹{premiumTotals.toLocaleString()}</div>
          </div>
          <div style={{ flex: 1, minWidth: 350 }}>
            <h3>Wallet Usage</h3>
            <PieChart width={250} height={250}>
              <Pie data={[{ name: 'Wallet', value: walletTotals }]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#A28BFE">
                <Cell key="cell-0" fill="#A28BFE" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
            <div style={{ fontWeight: 600, marginTop: 8 }}>Total: ₹{walletTotals.toLocaleString()}</div>
          </div>
          <div style={{ flex: 1, minWidth: 350 }}>
            <h3>Compliance Status by Country</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
              <thead>
                <tr>
                  <th>Country</th>
                  <th>GDPR</th>
                  <th>HIPAA</th>
                  <th>IRDAI</th>
                  <th>Total Tenants</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(complianceByCountry).map(([country, data]) => (
                  <tr key={country}>
                    <td>{country}</td>
                    <td>{data.GDPR}</td>
                    <td>{data.HIPAA}</td>
                    <td>{data.IRDAI}</td>
                    <td>{data.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
