"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { FamilyDefinitionForm } from "../../components/FamilyDefinitionForm";
import { SumInsuredSelector } from "../../components/SumInsuredSelector";
import { PremiumMatrixTable } from "../../components/PremiumMatrixTable";
import { RiderOptions } from "../../components/RiderOptions";
import { WalletContributionSlider } from "../../components/WalletContributionSlider";
import { PaymentMethodSelector } from "../../components/PaymentMethodSelector";
import { ProductSummaryCard } from "../../components/ProductSummaryCard";

export default function PlanConfigClient() {
  const API_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://benefitnest-backend.onrender.com";
  const [tenant, setTenant] = useState<any>(null);
  const [tenantResolved, setTenantResolved] = useState(false);
  const [policyTypes, setPolicyTypes] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [insurers, setInsurers] = useState<any[]>([]);
  const [tpas, setTpas] = useState<any[]>([]);
  const [planType, setPlanType] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [branding, setBranding] = useState<any>({});
  const [form, setForm] = useState<any>({});
  const [contract, setContract] = useState<any>({});
  const [configKV, setConfigKV] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({});
  const [alertError, setAlertError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingLists, setLoadingLists] = useState(true);
  const [prefillLoading, setPrefillLoading] = useState(false);

  const getAuthHeaders = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const host = window.location.hostname;
    const sub = host.split(".")[0];
    axios
      .get(`${API_URL}/api/portal/tenant/${sub}`)
      .then((r) => {
        setTenant(r.data?.data || null);
        setTenantResolved(true);
      })
      .catch(() => {
        setTenantResolved(true);
      });
  }, []);

  const currencyOptions = useMemo(
    () => [
      { value: "INR", label: "INR" },
      { value: "USD", label: "USD" },
      { value: "AED", label: "AED" },
      { value: "SGD", label: "SGD" },
    ],
    [],
  );

  const countryCodeFromName = useCallback((name: string) => {
    const map: Record<string, string> = {
      India: "IN",
      UAE: "AE",
      USA: "US",
      Singapore: "SG",
    };
    return map[name] || "IN";
  }, []);

  useEffect(() => {
    const loadLists = async () => {
      try {
        const headers = getAuthHeaders();
        const [pt, comp, lookups] = await Promise.all([
          axios.get(`${API_URL}/api/admin/masters/policy_type`, { headers }),
          axios.get(`${API_URL}/api/admin/compliance-policies/${tenant?.tenant_id || "unknown"}`, {
            headers,
          }),
          axios.get(`${API_URL}/api/admin/masters/lookups/all`, { headers }),
        ]);
        const ptData = pt.data?.data || pt.data || [];
        const look = lookups.data?.lookups || {};
        const insurersList = look.insurers || [];
        const tpaList = look.tpas || [];
        const countryDefaults = comp.data?.data ? [comp.data.data] : [];
        const countrySet = new Set<string>();
        const countryOptions: any[] = [];
        countryDefaults.forEach((d: any) => {
          const name = tenant?.country || "India";
          const code = countryCodeFromName(name);
          if (!countrySet.has(code)) {
            countrySet.add(code);
            countryOptions.push({ value: code, label: name });
          }
        });
        const activePT = (ptData || []).filter((p: any) => p.is_active !== false);
        setPolicyTypes(
          activePT.map((p: any) => ({
            value: p.code || p.name,
            label: p.name || p.code,
            id: p.id,
          })),
        );
        setCountries(countryOptions.length ? countryOptions : [
          { value: "IN", label: "India" },
          { value: "AE", label: "UAE" },
          { value: "US", label: "USA" },
          { value: "SG", label: "Singapore" },
        ]);
        setInsurers(insurersList.map((i: any) => ({ value: i.insurer_id, label: i.name })));
        setTpas(tpaList.map((t: any) => ({ value: t.tpa_id, label: t.name })));
      } catch {
      } finally {
        setLoadingLists(false);
      }
    };
    if (tenantResolved) loadLists();
  }, [tenantResolved, tenant, countryCodeFromName]);

  useEffect(() => {
    if (!tenant || !planType || !countryCode) return;
    const headers = getAuthHeaders();
    setPrefillLoading(true);

    const fetchData = async () => {
      try {
        const [policiesResp, contractsResp, configResp] = await Promise.all([
          axios.get(`${API_URL}/api/admin/masters/policies`, { headers }),
          axios.get(`${API_URL}/api/admin/masters/corporate_contracts`, { headers }),
          axios.get(`${API_URL}/api/admin/masters/policy_configuration`, { headers }),
        ]);

        // 1. Populate Policy Form
        const policies = policiesResp.data?.data || policiesResp.data || [];
        const existingPolicy = policies.find(
          (x: any) =>
            x.tenant_id === tenant.tenant_id &&
            (x.policy_type === planType || x.policy_type_code === planType),
        );

        if (existingPolicy) {
          setForm({
            name: existingPolicy.name || "",
            policy_number: existingPolicy.policy_number || "",
            insurer_id: existingPolicy.insurer_id || "",
            tpa_id: existingPolicy.tpa_id || "",
            start_date: existingPolicy.start_date || "",
            end_date: existingPolicy.end_date || "",
            status: existingPolicy.status || "DRAFT",
            insurer_policy_code: existingPolicy.insurer_policy_code || "",
            tpa_policy_code: existingPolicy.tpa_policy_code || "",
            rules: existingPolicy.rules || {},
          });
        } else {
          setForm({
            name: "",
            policy_number: "",
            insurer_id: "",
            tpa_id: "",
            start_date: "",
            end_date: "",
            status: "DRAFT",
            insurer_policy_code: "",
            tpa_policy_code: "",
            rules: {},
          });
        }

        // 2. Populate Contract Form
        const contracts = contractsResp.data?.data || contractsResp.data || [];
        const existingContract = contracts.find(
          (x: any) =>
            x.tenant_id === tenant.tenant_id &&
            (x.contract_type === planType || x.policy_type_code === planType),
        );

        if (existingContract) {
          setContract({
            contract_number: existingContract.contract_number || "",
            effective_date: existingContract.effective_date || "",
            expiry_date: existingContract.expiry_date || "",
            contract_value: existingContract.contract_value,
            currency: existingContract.currency || "INR",
            payment_terms: existingContract.payment_terms,
            billing_frequency: existingContract.billing_frequency || "",
            status: existingContract.status || "DRAFT",
          });
        } else {
          setContract({
            contract_number: "",
            effective_date: "",
            expiry_date: "",
            contract_value: undefined,
            currency: "INR",
            payment_terms: undefined,
            billing_frequency: "",
            status: "DRAFT",
          });
        }

        // 3. Populate Configuration
        const configs = configResp.data?.data || configResp.data || [];
        const ptId = policyTypes.find((p) => p.value === planType)?.id;
        
        let loadedConfigs = [];
        if (ptId) {
          const relevantConfigs = configs.filter((x: any) => x.policy_type_id === ptId);
          if (relevantConfigs.length > 0) {
            loadedConfigs = relevantConfigs;
          }
        }

        // Ensure default keys exist
        const requiredKeys = [
          { config_key: "family_definition", config_type: "STRING", value: null },
          { config_key: "sum_insured_list", config_type: "STRING", value: [] },
          { config_key: "premium_matrix", config_type: "STRING", value: null },
          { config_key: "rider_options", config_type: "STRING", value: [] },
          { config_key: "wallet_contribution", config_type: "NUMBER", value: 50 },
          { config_key: "payment_method", config_type: "STRING", value: "POSTPAID_INVOICE" },
        ];

        const finalConfigs = [...loadedConfigs];
        requiredKeys.forEach(def => {
            if (!finalConfigs.find((c: any) => c.config_key === def.config_key)) {
                finalConfigs.push({ ...def, is_required: false, is_active: true });
            }
        });
        setConfigKV(finalConfigs);

      } catch (error) {
        console.error("Error fetching plan details:", error);
      } finally {
        setPrefillLoading(false);
      }
    };

    fetchData();
  }, [tenant, planType, countryCode, policyTypes]);

  const validate = useCallback(() => {
    const e: any = {};
    if (!planType) e.planType = "Required";
    if (!countryCode) e.countryCode = "Required";
    if (!form.policy_number) e.policy_number = "Required";
    if (!form.start_date) e.start_date = "Required";
    if (form.end_date && form.start_date && form.end_date < form.start_date)
      e.end_date = "Must be after start date";
    if (contract.effective_date && contract.expiry_date && contract.expiry_date < contract.effective_date)
      e.expiry_date = "Must be after effective date";
    if (contract.contract_value !== undefined && Number(contract.contract_value) < 0)
      e.contract_value = "Must be ≥ 0";
    if (contract.payment_terms !== undefined && Number(contract.payment_terms) < 0)
      e.payment_terms = "Must be ≥ 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [planType, countryCode, form, contract]);

  const save = async () => {
    setAlertError(null);
    const ok = validate();
    if (!ok) return;
    setSaving(true);
    try {
      const headers = { "Content-Type": "application/json", ...getAuthHeaders() };
      const policiesResp = await axios.get(`${API_URL}/api/admin/masters/policies`, { headers });
      const allPolicies = policiesResp.data?.data || policiesResp.data || [];
      const existingPolicy = allPolicies.find(
        (x: any) =>
          x.tenant_id === tenant.tenant_id &&
          (x.policy_type === planType || x.policy_type_code === planType) &&
          x.policy_number === form.policy_number,
      );
      let policyRecord: any;
      if (existingPolicy) {
        const id = existingPolicy.id || existingPolicy.policy_id;
        const updates = {
          tenant_id: tenant.tenant_id,
          policy_type: planType,
          name: form.name || null,
          policy_number: form.policy_number,
          insurer_id: form.insurer_id || null,
          tpa_id: form.tpa_id || null,
          start_date: form.start_date,
          end_date: form.end_date || null,
          status: form.status || "DRAFT",
          insurer_policy_code: form.insurer_policy_code || null,
          tpa_policy_code: form.tpa_policy_code || null,
          rules: form.rules || {},
        };
        const r = await axios.put(`${API_URL}/api/admin/masters/policies/${id}`, { updates }, { headers });
        policyRecord = r.data?.data || updates;
      } else {
        const record = {
          tenant_id: tenant.tenant_id,
          policy_type: planType,
          name: form.name || null,
          policy_number: form.policy_number,
          insurer_id: form.insurer_id || null,
          tpa_id: form.tpa_id || null,
          start_date: form.start_date,
          end_date: form.end_date || null,
          status: form.status || "DRAFT",
          insurer_policy_code: form.insurer_policy_code || null,
          tpa_policy_code: form.tpa_policy_code || null,
          rules: form.rules || {},
        };
        const r = await axios.post(`${API_URL}/api/admin/masters/policies`, { record }, { headers });
        policyRecord = r.data?.data || record;
      }
      const contractsResp = await axios.get(`${API_URL}/api/admin/masters/corporate_contracts`, { headers });
      const allContracts = contractsResp.data?.data || contractsResp.data || [];
      const existingContract = allContracts.find(
        (x: any) =>
          x.tenant_id === tenant.tenant_id &&
          (x.contract_type === planType || x.policy_type_code === planType) &&
          x.contract_number === contract.contract_number,
      );
      if (existingContract) {
        const id = existingContract.id || existingContract.contract_id;
        const updates = {
          tenant_id: tenant.tenant_id,
          contract_type: planType,
          contract_number: contract.contract_number,
          effective_date: contract.effective_date,
          expiry_date: contract.expiry_date || null,
          contract_value: contract.contract_value ?? null,
          currency: contract.currency || "INR",
          payment_terms: contract.payment_terms ?? null,
          billing_frequency: contract.billing_frequency ?? null,
          status: contract.status || "DRAFT",
        };
        await axios.put(`${API_URL}/api/admin/masters/corporate_contracts/${id}`, { updates }, { headers });
      } else {
        const record = {
          tenant_id: tenant.tenant_id,
          contract_type: planType,
          contract_number: contract.contract_number,
          effective_date: contract.effective_date,
          expiry_date: contract.expiry_date || null,
          contract_value: contract.contract_value ?? null,
          currency: contract.currency || "INR",
          payment_terms: contract.payment_terms ?? null,
          billing_frequency: contract.billing_frequency ?? null,
          status: contract.status || "DRAFT",
        };
        await axios.post(`${API_URL}/api/admin/masters/corporate_contracts`, { record }, { headers });
      }
      const ptId =
        policyTypes.find((p) => p.value === planType)?.id ||
        policyTypes.find((p) => p.label === planType)?.id ||
        null;
      if (ptId) {
        const cfgResp = await axios.get(`${API_URL}/api/admin/masters/policy_configuration`, { headers });
        const allCfg = cfgResp.data?.data || cfgResp.data || [];
        for (const kv of configKV) {
          const found = allCfg.find(
            (x: any) => x.policy_type_id === ptId && x.config_key === kv.config_key,
          );
          if (found) {
            const id = found.id;
            const updates = {
              policy_type_id: ptId,
              config_key: kv.config_key,
              config_type: kv.config_type,
              value: kv.value,
              is_active: true,
              is_required: kv.is_required === true,
            };
            await axios.put(`${API_URL}/api/admin/masters/policy_configuration/${id}`, { updates }, { headers });
          } else {
            const record = {
              policy_type_id: ptId,
              config_key: kv.config_key,
              config_type: kv.config_type,
              value: kv.value,
              is_active: true,
              is_required: kv.is_required === true,
            };
            await axios.post(`${API_URL}/api/admin/masters/policy_configuration`, { record }, { headers });
          }
        }
      }
      alert("Saved successfully");
    } catch (e: any) {
      setAlertError(e?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const getConfigValue = (key: string, defaultVal: any) => {
    const item = configKV.find((x) => x.config_key === key);
    if (!item) return defaultVal;
    if (item.config_type === "BOOLEAN") return item.value === "true" || item.value === true;
    if (item.config_type === "NUMBER") return Number(item.value);
    try {
        if (typeof item.value === "string" && (item.value.startsWith("{") || item.value.startsWith("["))) {
            return JSON.parse(item.value);
        }
    } catch {}
    return item.value;
  };

  const updateConfig = (key: string, val: any, type: string = "STRING") => {
    setConfigKV((prev) => {
      const existingIndex = prev.findIndex((x) => x.config_key === key);
      const valueToStore = typeof val === "object" ? JSON.stringify(val) : val;
      
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = { ...copy[existingIndex], value: valueToStore, config_type: type };
        return copy;
      } else {
        return [...prev, { config_key: key, value: valueToStore, config_type: type, is_required: false, is_active: true }];
      }
    });
  };

  return (
    <div>
      {alertError && (
        <div
          style={{
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            border: "1px solid #fecaca",
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
          }}
        >
          {alertError}
        </div>
      )}
      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
              Policy Type
            </div>
            <select
              value={planType}
              onChange={(e) => setPlanType(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                fontSize: 14,
                backgroundColor: "white",
              }}
            >
              <option value="">Select Policy Type</option>
              {policyTypes.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.planType && (
              <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>{errors.planType}</div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
              Country
            </div>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                fontSize: 14,
                backgroundColor: "white",
              }}
            >
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            {errors.countryCode && (
              <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>
                {errors.countryCode}
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
              Tenant
            </div>
            <input
              value={
                tenant
                  ? `${tenant.tenant_code || tenant.tenant_id} • ${tenant.corporate_legal_name || ""}`
                  : ""
              }
              readOnly
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                fontSize: 14,
                backgroundColor: "#f9fafb",
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
            <button
              onClick={save}
              disabled={saving || loadingLists || prefillLoading}
              style={{
                padding: "10px 16px",
                backgroundColor: saving ? "#9ca3af" : "#2563eb",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 16,
        }}
      >
        <div style={{ display: "grid", gap: 16 }}>
          <div
            style={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Policy Details</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
                  Policy Name
                </div>
                <input
                  value={form.name || ""}
                  onChange={(e) => setForm((p: any) => ({ ...p, name: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
                  Policy Number
                </div>
                <input
                  value={form.policy_number || ""}
                  onChange={(e) =>
                    setForm((p: any) => ({ ...p, policy_number: e.target.value.trim() }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
                {errors.policy_number && (
                  <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>
                    {errors.policy_number}
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
                  Insurer
                </div>
                <select
                  value={form.insurer_id || ""}
                  onChange={(e) => setForm((p: any) => ({ ...p, insurer_id: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                    backgroundColor: "white",
                  }}
                >
                  <option value="">Select Insurer</option>
                  {insurers.map((i) => (
                    <option key={i.value} value={i.value}>
                      {i.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
                  TPA
                </div>
                <select
                  value={form.tpa_id || ""}
                  onChange={(e) => setForm((p: any) => ({ ...p, tpa_id: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                    backgroundColor: "white",
                  }}
                >
                  <option value="">Select TPA</option>
                  {tpas.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
                  Start Date
                </div>
                <input
                  type="date"
                  value={form.start_date || ""}
                  onChange={(e) => setForm((p: any) => ({ ...p, start_date: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
                {errors.start_date && (
                  <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>
                    {errors.start_date}
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
                  End Date
                </div>
                <input
                  type="date"
                  value={form.end_date || ""}
                  onChange={(e) => setForm((p: any) => ({ ...p, end_date: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
                {errors.end_date && (
                  <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>
                    {errors.end_date}
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
                  Policy Status
                </div>
                <select
                  value={form.status || "DRAFT"}
                  onChange={(e) => setForm((p: any) => ({ ...p, status: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                    backgroundColor: "white",
                  }}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="DRAFT">DRAFT</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
                  Insurer Policy Code
                </div>
                <input
                  value={form.insurer_policy_code || ""}
                  onChange={(e) =>
                    setForm((p: any) => ({ ...p, insurer_policy_code: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
                  TPA Policy Code
                </div>
                <input
                  value={form.tpa_policy_code || ""}
                  onChange={(e) =>
                    setForm((p: any) => ({ ...p, tpa_policy_code: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Contract</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
                  Contract Number
                </div>
                <input
                  value={contract.contract_number || ""}
                  onChange={(e) =>
                    setContract((p: any) => ({ ...p, contract_number: e.target.value.trim() }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
                  Effective Date
                </div>
                <input
                  type="date"
                  value={contract.effective_date || ""}
                  onChange={(e) =>
                    setContract((p: any) => ({ ...p, effective_date: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
                  Expiry Date
                </div>
                <input
                  type="date"
                  value={contract.expiry_date || ""}
                  onChange={(e) =>
                    setContract((p: any) => ({ ...p, expiry_date: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
                {errors.expiry_date && (
                  <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>
                    {errors.expiry_date}
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
                  Contract Value
                </div>
                <input
                  type="number"
                  min={0}
                  value={contract.contract_value ?? ""}
                  onChange={(e) =>
                    setContract((p: any) => ({ ...p, contract_value: Number(e.target.value) }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
                {errors.contract_value && (
                  <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>
                    {errors.contract_value}
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
                  Currency
                </div>
                <select
                  value={contract.currency || "INR"}
                  onChange={(e) => setContract((p: any) => ({ ...p, currency: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                    backgroundColor: "white",
                  }}
                >
                  {currencyOptions.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
                  Payment Terms (days)
                </div>
                <input
                  type="number"
                  min={0}
                  value={contract.payment_terms ?? ""}
                  onChange={(e) =>
                    setContract((p: any) => ({ ...p, payment_terms: Number(e.target.value) }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
                {errors.payment_terms && (
                  <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>
                    {errors.payment_terms}
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
                  Billing Frequency
                </div>
                <select
                  value={contract.billing_frequency || ""}
                  onChange={(e) =>
                    setContract((p: any) => ({ ...p, billing_frequency: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                    backgroundColor: "white",
                  }}
                >
                  <option value="">Select</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annual">Annual</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
                  Status
                </div>
                <select
                  value={contract.status || "DRAFT"}
                  onChange={(e) => setContract((p: any) => ({ ...p, status: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                    backgroundColor: "white",
                  }}
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="ACTIVE">ACTIVE</option>
                </select>
              </div>
            </div>
          </div>

          {/* New Advanced Configuration Section */}
          <div style={{ display: "grid", gap: 16 }}>
            <FamilyDefinitionForm
              value={getConfigValue("family_definition", null)}
              onChange={(v) => updateConfig("family_definition", v)}
            />
            <SumInsuredSelector
              value={getConfigValue("sum_insured_list", [])}
              onChange={(v) => updateConfig("sum_insured_list", v)}
            />
            <PremiumMatrixTable
              value={getConfigValue("premium_matrix", null)}
              onChange={(v) => updateConfig("premium_matrix", v)}
            />
            <RiderOptions
              value={getConfigValue("rider_options", [])}
              onChange={(v) => updateConfig("rider_options", v)}
            />
            <WalletContributionSlider
              value={getConfigValue("wallet_contribution", 50)}
              onChange={(v) => updateConfig("wallet_contribution", v, "NUMBER")}
            />
            <PaymentMethodSelector
              value={getConfigValue("payment_method", "POSTPAID_INVOICE")}
              onChange={(v) => updateConfig("payment_method", v)}
            />
          </div>
        </div>

        <div>
          <div
            style={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
              Summary
            </div>
            <div style={{ display: "grid", gap: 8, fontSize: 14, color: "#374151" }}>
              <div>
                <strong>Policy:</strong> {planType || "-"} • {form.policy_number || "-"}
              </div>
              <div>
                <strong>Dates:</strong> {form.start_date || "-"} → {form.end_date || "-"}
              </div>
              <div>
                <strong>Insurer/TPA:</strong>{" "}
                {(insurers.find((i) => i.value === form.insurer_id)?.label as any) || "-"} /{" "}
                {(tpas.find((t) => t.value === form.tpa_id)?.label as any) || "-"}
              </div>
              <div>
                <strong>Contract:</strong> {contract.status || "DRAFT"} •{" "}
                {contract.billing_frequency || "-"}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            {ProductSummaryCard && (
              <ProductSummaryCard
                config={configKV}
                selection={form as any}
                branding={branding as any}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
