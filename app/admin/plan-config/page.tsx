"use client";
import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { usePlanConfig } from "@/hooks/usePlanConfig";
import { useOverrides } from "@/hooks/useOverrides";
import { gql, useApolloClient } from "@apollo/client";
import { FamilyDefinitionForm } from "@/components/FamilyDefinitionForm";
import { SumInsuredSelector } from "@/components/SumInsuredSelector";
import { PremiumMatrixTable } from "@/components/PremiumMatrixTable";
import { RiderOptions } from "@/components/RiderOptions";
import { WalletContributionSlider } from "@/components/WalletContributionSlider";
import { PaymentMethodSelector } from "@/components/PaymentMethodSelector";
import { ProductSummaryCard } from "@/components/ProductSummaryCard";

export default function PlanConfigPage() {
  const { user, token } = useSession();
  const [planType, setPlanType] = useState("GMC");
  const [countryCode, setCountryCode] = useState("IN");
  const [corporateId, setCorporateId] = useState("");
  const [branding, setBranding] = useState<any>({});
  const [form, setForm] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const client = useApolloClient();

  useEffect(() => {
    // Extract corporateId/subdomain from window.location
    const host = window.location.hostname;
    setCorporateId(host.split(".")[0]);
  }, []);

  const { config, loading: configLoading } = usePlanConfig(planType, corporateId, countryCode);
  const effectiveConfig = useOverrides(config, countryCode);

  useEffect(() => {
    setForm({});
    setPreview(effectiveConfig);
    setBranding({ font: effectiveConfig?.branding?.font, background: effectiveConfig?.branding?.background, color: effectiveConfig?.branding?.color, logo: effectiveConfig?.branding?.logo });
  }, [effectiveConfig]);

  const handleField = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
    setPreview({ ...effectiveConfig, ...form, [field]: value });
  };

  const handleSave = async () => {
    setLoading(true);
    await client.mutate({
      mutation: gql`
        mutation UpdateConfig($planType: String!, $corporateId: String!, $input: JSON!) {
          updateConfig(planType: $planType, corporateId: $corporateId, newConfig: $input) { status }
        }
      `,
      variables: { planType, corporateId, input: { ...effectiveConfig, ...form } }
    });
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: branding?.font || "inherit", background: branding?.background || "#fff", color: branding?.color || "#222" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 16, padding: 16 }}>
        {branding?.logo && <img src={branding.logo} alt="Logo" height={40} />}
        <h1>Benefit Plan Configuration</h1>
        <select value={planType} onChange={e => setPlanType(e.target.value)}>
          <option value="GMC">Group Medical (GMC)</option>
          <option value="GPA">Personal Accident (GPA)</option>
          <option value="GTL">Term Life (GTL)</option>
          <option value="Flex">Flex</option>
          <option value="Wallet">Wallet</option>
          <option value="Custom">Custom</option>
        </select>
        <select value={countryCode} onChange={e => setCountryCode(e.target.value)}>
          <option value="IN">India</option>
          <option value="SG">Singapore</option>
          <option value="AE">UAE</option>
          <option value="US">USA</option>
          <option value="GLOBAL">Global</option>
        </select>
      </header>
      {(configLoading || loading) ? (
        <div style={{ padding: 32 }}>Loading...</div>
      ) : effectiveConfig ? (
        <div style={{ display: "flex", gap: 32, alignItems: "flex-start", padding: 32 }}>
          <div style={{ flex: 2 }}>
            <FamilyDefinitionForm value={form.family} onChange={v => handleField('family', v)} config={effectiveConfig} branding={branding} errors={errors} />
            <SumInsuredSelector value={form.sumInsured} onChange={v => handleField('sumInsured', v)} config={effectiveConfig} branding={branding} errors={errors} />
            <PremiumMatrixTable config={effectiveConfig} selection={form} branding={branding} />
            <RiderOptions value={form.riders} onChange={v => handleField('riders', v)} config={effectiveConfig} branding={branding} errors={errors} />
            <WalletContributionSlider value={form.wallet} onChange={v => handleField('wallet', v)} config={effectiveConfig} branding={branding} errors={errors} />
            <PaymentMethodSelector value={form.payment} onChange={v => handleField('payment', v)} config={effectiveConfig} branding={branding} errors={errors} />
            <button onClick={handleSave} disabled={loading} style={{ marginTop: 24 }}>Save Configuration</button>
          </div>
          <div style={{ flex: 1, minWidth: 320 }}>
            <ProductSummaryCard config={effectiveConfig} selection={form} branding={branding} />
          </div>
        </div>
      ) : (
        <div style={{ padding: 32 }}>No configuration found.</div>
      )}
    </div>
  );
}
