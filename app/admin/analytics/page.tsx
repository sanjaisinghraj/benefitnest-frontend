
"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { gql } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";
// import { useQuery } from '@apollo/client/react'; // Add if needed
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28BFE", "#FF6699"];

export default function AdminAnalyticsPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const client = useApolloClient();
  const [corporateId, setCorporateId] = useState("");
  const [planType, setPlanType] = useState("");
  const [country, setCountry] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [events, setEvents] = useState<any[]>([]);
  const [facts, setFacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [branding, setBranding] = useState<any>({});

  useEffect(() => {
    // Optionally fetch branding from config
    setBranding({ font: "Inter, sans-serif", background: "#fff", color: "#222" });
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    const res1 = await client.query({
      query: gql`
        query GetAnalyticsEvents($corporateId: String, $planType: String, $country: String, $from: String, $to: String) {
          getAnalyticsEvents(corporateId: $corporateId, planType: $planType, country: $country, from: $from, to: $to) {
            event
            payload_json
            ts
          }
        }
      `,
      variables: { corporateId, planType, country, from: dateRange.from, to: dateRange.to },
      fetchPolicy: "network-only"
    });
    const res2 = await client.query({
      query: gql`
        query GetPlanActionFacts($corporateId: String, $planType: String, $country: String, $from: String, $to: String) {
          getPlanActionFacts(corporateId: $corporateId, planType: $planType, country: $country, from: $from, to: $to) {
            corporateId
            planType
            actionType
            premium
            walletUsage
            ts
          }
        }
      `,
      variables: { corporateId, planType, country, from: dateRange.from, to: dateRange.to },
      fetchPolicy: "network-only"
    });
    setEvents((res1.data as any).getAnalyticsEvents || []);
    setFacts((res2.data as any).getPlanActionFacts || []);
    setLoading(false);
  };

  useEffect(() => {
    if (session) fetchAnalytics();
    // eslint-disable-next-line
  }, [corporateId, planType, country, dateRange, session]);

  // Aggregate data for charts
  const enrollmentsByPlan = facts.reduce((acc, f) => {
    if (f.actionType === "enrollment") {
      acc[f.planType] = (acc[f.planType] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const endorsementsByType = facts.reduce((acc, f) => {
    if (f.actionType === "endorsement") {
      acc[f.planType] = (acc[f.planType] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const premiumTotals = facts.reduce((acc, f) => acc + (f.premium || 0), 0);
  const walletTotals = facts.reduce((acc, f) => acc + (f.walletUsage || 0), 0);

  // SLA compliance (dummy: count events with event === 'enrollment_workflow_completed')
  const slaCompliant = events.filter(e => e.event === 'enrollment_workflow_completed').length;
  const slaFailed = events.filter(e => e.event === 'enrollment_workflow_failed').length;

  return (
    <div style={{ fontFamily: branding.font, background: branding.background, color: branding.color, minHeight: '100vh', padding: 32 }}>
      <h1>Admin Analytics Dashboard</h1>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <input placeholder="Corporate ID" value={corporateId} onChange={e => setCorporateId(e.target.value)} />
        <input placeholder="Plan Type" value={planType} onChange={e => setPlanType(e.target.value)} />
        <input placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} />
        <input type="date" value={dateRange.from} onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))} />
        <input type="date" value={dateRange.to} onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))} />
        <button onClick={fetchAnalytics} disabled={loading}>Refresh</button>
      </div>
      {loading ? <div>Loading...</div> : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
          <div style={{ flex: 1, minWidth: 350 }}>
            <h3>Enrollments by Plan</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={Object.entries(enrollmentsByPlan).map(([plan, count]) => ({ plan, count }))}>
                <XAxis dataKey="plan" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: 1, minWidth: 350 }}>
            <h3>Endorsements by Plan</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={Object.entries(endorsementsByType).map(([plan, count]) => ({ plan, count }))}>
                <XAxis dataKey="plan" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#FF8042" />
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
            <h3>SLA Compliance</h3>
            <BarChart width={250} height={250} data={[
              { name: 'Compliant', value: slaCompliant },
              { name: 'Failed', value: slaFailed }
            ]}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#00C49F" />
            </BarChart>
            <div style={{ fontWeight: 600, marginTop: 8 }}>Compliant: {slaCompliant} | Failed: {slaFailed}</div>
          </div>
        </div>
      )}
    </div>
  );
}
