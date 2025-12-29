
"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useApolloClient } from "@apollo/client/react";

// Extend user type to allow roles
type UserWithRoles = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  roles?: string[];
};
import { gql } from "@apollo/client";
// import { useQuery } from '@apollo/client/react'; // Add if needed

export default function TenantManagementPage() {
  const session = useSession();
  const user = session.data?.user as UserWithRoles | undefined;
  const client = useApolloClient();
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Check Keycloak roles
    setIsSuperAdmin(Array.isArray(user?.roles) && user.roles.includes("super-admin"));
    fetchTenants();
    // eslint-disable-next-line
  }, [user]);

  const fetchTenants = async () => {
    setLoading(true);
    const res = await client.query({
      query: gql`
        query TenantList {
          tenantList { id name country_code compliance_flags status config_json }
        }
      `,
      fetchPolicy: "network-only"
    });
    // Type guard for res.data
    const data = (res.data as { tenantList?: any[] }) || {};
    setTenants(data.tenantList || []);
    setLoading(false);
  };

  const handleSelect = async (tenant: any) => {
    setSelectedTenant(tenant);
    setForm({ ...tenant });
  };

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    const mutation = form.id ? "updateTenant" : "createTenant";
    await client.mutate({
      mutation: gql`
        mutation SaveTenant($input: TenantInput!) {
          ${mutation}(input: $input) { id name }
        }
      `,
      variables: { input: form }
    });
    setMessage("Tenant saved.");
    fetchTenants();
    setLoading(false);
  };

  const handleDeactivate = async (tenantId: string) => {
    setLoading(true);
    await client.mutate({
      mutation: gql`
        mutation DeactivateTenant($tenantId: String!) {
          deactivateTenant(tenantId: $tenantId) { id status }
        }
      `,
      variables: { tenantId }
    });
    setMessage("Tenant deactivated.");
    fetchTenants();
    setLoading(false);
  };

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: "0 auto" }}>
      <h1>Tenant Management</h1>
      {isSuperAdmin && (
        <button onClick={() => { setSelectedTenant(null); setForm({}); }}>+ New Tenant</button>
      )}
      <table style={{ width: "100%", marginTop: 24, borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Country</th>
            <th>Compliance</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map(t => (
            <tr key={t.id} style={{ background: selectedTenant?.id === t.id ? "#f0f8ff" : undefined }}>
              <td>{t.name}</td>
              <td>{t.country_code}</td>
              <td>{(t.compliance_flags || []).join(", ")}</td>
              <td>{t.status}</td>
              <td>
                <button onClick={() => handleSelect(t)}>Edit</button>
                {isSuperAdmin && t.status === "active" && (
                  <button onClick={() => handleDeactivate(t.id)} style={{ marginLeft: 8 }}>Deactivate</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedTenant !== null && (
        <div style={{ marginTop: 32, border: "1px solid #eee", borderRadius: 8, padding: 24 }}>
          <h2>{form.id ? "Edit Tenant" : "Create Tenant"}</h2>
          <label>Name: <input value={form.name || ""} onChange={e => handleChange("name", e.target.value)} /></label><br />
          <label>Country: <input value={form.country_code || ""} onChange={e => handleChange("country_code", e.target.value)} /></label><br />
          <label>Compliance Flags: <input value={(form.compliance_flags || []).join(", ")} onChange={e => handleChange("compliance_flags", e.target.value.split(",").map((f: string) => f.trim()))} placeholder="GDPR, HIPAA, IRDAI" /></label><br />
          <label>Status: <input value={form.status || "active"} onChange={e => handleChange("status", e.target.value)} /></label><br />
          <label>Config (JSON): <textarea value={JSON.stringify(form.config_json || {}, null, 2)} onChange={e => handleChange("config_json", JSON.parse(e.target.value))} rows={6} style={{ width: 400 }} /></label><br />
          <button onClick={handleSave} disabled={loading}>{form.id ? "Update" : "Create"}</button>
        </div>
      )}
      {message && <div style={{ marginTop: 24, color: "green" }}>{message}</div>}
    </div>
  );
}
