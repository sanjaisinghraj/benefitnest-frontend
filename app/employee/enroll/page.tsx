
"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { usePlanConfig } from "../../../hooks/usePlanConfig";
import { useEnrollment } from "../../../hooks/useEnrollment";
import { useOverrides } from "../../../hooks/useOverrides";
import { FamilyDefinitionForm } from "../../components/FamilyDefinitionForm";
import { SumInsuredSelector } from "../../components/SumInsuredSelector";
import { PremiumMatrixTable } from "../../components/PremiumMatrixTable";
import { RiderOptions } from "../../components/RiderOptions";
import { WalletContributionSlider } from "../../components/WalletContributionSlider";
import { PaymentMethodSelector } from "../../components/PaymentMethodSelector";
import { ProductSummaryCard } from "../../components/ProductSummaryCard";

// Use any for custom component props to resolve prop type errors quickly
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProps = any;

export default function EmployeeEnrollPage() {
  const session = useSession();
  const user = session.data?.user;
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

  const planConfigResult: any = usePlanConfig(planType, corporateId, countryCode);
  const config: any = planConfigResult.config;
  const configLoading: boolean = planConfigResult.loading;
  const effectiveConfig: any = useOverrides(config, countryCode) || {};
  const enrollmentResult: any = useEnrollment(planType, corporateId);
  const enroll = enrollmentResult.enroll;
  const enrollLoading: boolean = enrollmentResult.loading;

  useEffect(() => {
    setForm({});
    setBranding({
      font: effectiveConfig?.branding?.font,
      background: effectiveConfig?.branding?.background,
      color: effectiveConfig?.branding?.color,
      logo: effectiveConfig?.branding?.logo
    } as any);
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
            <FamilyDefinitionForm value={form.family} onChange={(v: any) => handleField('family', v)} config={effectiveConfig as any} branding={branding as any} errors={errors as any} />
            <SumInsuredSelector value={form.sumInsured} onChange={(v: any) => handleField('sumInsured', v)} config={effectiveConfig as any} branding={branding as any} errors={errors as any} />
            <PremiumMatrixTable config={effectiveConfig as any} selection={form as any} branding={branding as any} />
            <RiderOptions value={form.riders} onChange={(v: any) => handleField('riders', v)} config={effectiveConfig as any} branding={branding as any} errors={errors as any} />
            <WalletContributionSlider value={form.wallet} onChange={(v: any) => handleField('wallet', v)} config={effectiveConfig as any} branding={branding as any} errors={errors as any} />
            <PaymentMethodSelector value={form.payment} onChange={(v: any) => handleField('payment', v)} config={effectiveConfig as any} branding={branding as any} errors={errors as any} />
            <button onClick={handleSubmit} disabled={enrollLoading || !!enrollResult} style={{ marginTop: 24 }}>Submit Enrollment</button>
            {enrollResult && <div style={{ marginTop: 24, color: "green" }}>{enrollResult}</div>}
          </div>
          <div style={{ flex: 1, minWidth: 320 }}>
            <ProductSummaryCard config={effectiveConfig as any} selection={form as any} branding={branding as any} />
          </div>
        </div>
      ) : (
        <div>No plan configuration found.</div>
      )}
    </div>
  );
}
