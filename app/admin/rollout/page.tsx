
"use client";
import { useState, useEffect } from "react";
import { gql } from "@apollo/client";
// import { useQuery } from '@apollo/client/react'; // Add if needed
import { useSession } from "next-auth/react";

// Extend user type to allow roles
type UserWithRoles = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  roles?: string[];
};
import { useApolloClient } from "@apollo/client/react";

export default function RolloutDashboard() {
  const session = useSession();
  const user = session.data?.user as UserWithRoles | undefined;
  const client = useApolloClient();
  const [tenants, setTenants] = useState<any[]>([]);
  const [modules, setModules] = useState<string[]>(["GMC", "GPA", "GTL", "Flex", "Wallet", "Wellness", "Custom"]);
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [phased, setPhased] = useState(false);
  const [rollouts, setRollouts] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const isSuperAdmin = Array.isArray(user?.roles) && user.roles.includes("super-admin");

  useEffect(() => {
    fetchTenants();
    // fetchRollouts(); // Optionally fetch rollout history
    // eslint-disable-next-line
  }, []);

  const fetchTenants = async () => {
    const res = await client.query({
      query: gql`
        query TenantList { tenantList { id name } }
      `,
      fetchPolicy: "network-only"
    });
    // Type guard for res.data
    const data = (res.data as { tenantList?: any[] }) || {};
    setTenants(data.tenantList || []);
  };

  const handleSchedule = async () => {
    if (!isSuperAdmin) return;
    const res = await client.mutate({
      mutation: gql`
        mutation ScheduleRollout($tenantIds: [String!]!, $modules: [String!]!, $startDate: String!, $phased: Boolean!) {
          scheduleRollout(tenantIds: $tenantIds, modules: $modules, startDate: $startDate, phased: $phased) { rolloutId status }
        }
      `,
      variables: { tenantIds: selectedTenants, modules: selectedModules, startDate, phased }
    });
    // Type guard for res.data
    const data = (res.data as { scheduleRollout?: { rolloutId?: string } }) || {};
    setMessage(`Rollout scheduled: ${data.scheduleRollout?.rolloutId}`);
  };

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: "0 auto" }}>
      <h1>Global Rollout Dashboard</h1>
      {!isSuperAdmin && <div style={{ color: "red" }}>Access denied. Super-admins only.</div>}
      {isSuperAdmin && (
        <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 24, marginBottom: 32 }}>
          <h2>Schedule Rollout</h2>
          <label>Tenants:<br />
            <select multiple value={selectedTenants} onChange={e => setSelectedTenants(Array.from(e.target.selectedOptions, o => o.value))} style={{ width: 300, height: 100 }}>
              {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label><br />
          <label>Modules:<br />
            <select multiple value={selectedModules} onChange={e => setSelectedModules(Array.from(e.target.selectedOptions, o => o.value))} style={{ width: 300, height: 100 }}>
              {modules.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </label><br />
          <label>Start Date: <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></label><br />
          <label><input type="checkbox" checked={phased} onChange={e => setPhased(e.target.checked)} /> Phased Rollout</label><br />
          <button onClick={handleSchedule} style={{ marginTop: 16 }}>Schedule Rollout</button>
        </div>
      )}
      {message && <div style={{ color: "green" }}>{message}</div>}
      {/* Optionally: Show rollout progress, adoption metrics, rollback controls */}
    </div>
  );
}
