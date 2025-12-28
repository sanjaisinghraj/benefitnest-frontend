
"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { usePlanConfig } from "../../hooks/usePlanConfig";
import { useEnrollment } from "../../hooks/useEnrollment";
import { useOverrides } from "../../hooks/useOverrides";
import { FamilyDefinitionForm } from "../../components/FamilyDefinitionForm";
import { SumInsuredSelector } from "../../components/SumInsuredSelector";
import { PremiumMatrixTable } from "../../components/PremiumMatrixTable";
import { RiderOptions } from "../../components/RiderOptions";
import { WalletContributionSlider } from "../../components/WalletContributionSlider";
import { PaymentMethodSelector } from "../../components/PaymentMethodSelector";
import { ProductSummaryCard } from "../../components/ProductSummaryCard";

export default function EmployeeEnrollPage() {
  const { user, token } = useSession();
  const [planType, setPlanType] = useState("GMC");
  const [countryCode, setCountryCode] = useState("IN");
  const [corporateId, setCorporateId] = useState("");
  const [branding, setBranding] = useState<any>({});
  const [form, setForm] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const [enrollResult, setEnrollResult] = useState<string | null>(null);

  useEffect(() => {
    const host = window.location.hostname;
    setCorporateId(host.split(".")[0]);
  }, []);

  const { config, loading: configLoading } = usePlanConfig(planType, corporateId, countryCode);
  const effectiveConfig = useOverrides(config, countryCode);
  const { enroll, loading: enrollLoading } = useEnrollment(planType, corporateId);

  useEffect(() => {
    setForm({});
    setBranding({ font: effectiveConfig?.branding?.font, background: effectiveConfig?.branding?.background, color: effectiveConfig?.branding?.color, logo: effectiveConfig?.branding?.logo });
  }, [effectiveConfig]);

  const handleField = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const result = await enroll({ ...form });
    setEnrollResult(result?.message || "Enrollment submitted.");
  };

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: "0 auto", fontFamily: branding?.font || "inherit", background: branding?.background || "#fff", color: branding?.color || "#222" }}>
      <h1>Employee Benefit Enrollment</h1>
      <div style={{ marginBottom: 24 }}>
        <label>Select Plan: </label>
        <select value={planType} onChange={e => setPlanType(e.target.value)}>
          <option value="GMC">GMC</option>
          <option value="GPA">GPA</option>
          <option value="GTL">GTL</option>
          <option value="Flex">Flex</option>
          <option value="Wallet">Wallet</option>
          <option value="Custom">Custom</option>
        </select>
        <select value={countryCode} onChange={e => setCountryCode(e.target.value)} style={{ marginLeft: 16 }}>
          <option value="IN">India</option>
          <option value="SG">Singapore</option>
          <option value="AE">UAE</option>
          <option value="US">USA</option>
          <option value="GLOBAL">Global</option>
        </select>
      </div>
      {(configLoading || enrollLoading) ? (
        <div>Loading...</div>
      ) : effectiveConfig ? (
        <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
          <div style={{ flex: 2 }}>
            <FamilyDefinitionForm value={form.family} onChange={v => handleField('family', v)} config={effectiveConfig} branding={branding} errors={errors} />
            <SumInsuredSelector value={form.sumInsured} onChange={v => handleField('sumInsured', v)} config={effectiveConfig} branding={branding} errors={errors} />
            <PremiumMatrixTable config={effectiveConfig} selection={form} branding={branding} />
            <RiderOptions value={form.riders} onChange={v => handleField('riders', v)} config={effectiveConfig} branding={branding} errors={errors} />
            <WalletContributionSlider value={form.wallet} onChange={v => handleField('wallet', v)} config={effectiveConfig} branding={branding} errors={errors} />
            <PaymentMethodSelector value={form.payment} onChange={v => handleField('payment', v)} config={effectiveConfig} branding={branding} errors={errors} />
            <button onClick={handleSubmit} disabled={enrollLoading || !!enrollResult} style={{ marginTop: 24 }}>Submit Enrollment</button>
            {enrollResult && <div style={{ marginTop: 24, color: "green" }}>{enrollResult}</div>}
          </div>
          <div style={{ flex: 1, minWidth: 320 }}>
            <ProductSummaryCard config={effectiveConfig} selection={form} branding={branding} />
          </div>
        </div>
      ) : (
        <div>No plan configuration found.</div>
      )}
    </div>
  );
}
