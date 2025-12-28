"use client";
import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { gql, useApolloClient } from "@apollo/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

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

  useEffect(() => {
    setIsSuperAdmin(user?.roles?.includes("super-admin"));
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

  if (!isSuperAdmin) return <div style={{ padding: 32 }}>Access denied.</div>;

  return (
    <div style={{ fontFamily: branding.font, background: branding.background, color: branding.color, minHeight: '100vh', padding: 32 }}>
      <h1>Tenant Analytics Dashboard</h1>
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
