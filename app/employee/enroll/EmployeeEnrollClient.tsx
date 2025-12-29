"use client";
import React, { useMemo, useState } from "react";
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

export default function EmployeeEnrollClient() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const [planType, setPlanType] = useState("GMC");
  const [countryCode, setCountryCode] = useState("IN");
  const [corporateId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return window.location.hostname.split(".")[0] || "";
  });
  type Branding = {
    font?: string;
    background?: string;
    color?: string;
    logo?: string;
  };
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [enrollResult, setEnrollResult] = useState<string | null>(null);

  // corporateId is derived in the state initializer; no effect needed

  const planConfigResult = usePlanConfig(
    planType,
    corporateId,
    countryCode,
  ) as { config?: unknown; loading?: boolean };
  const config = planConfigResult.config;
  const configLoading: boolean = !!planConfigResult.loading;
  const effectiveConfig = (useOverrides(config, countryCode) || {}) as unknown;
  const enrollmentResult = useEnrollment(planType, corporateId) as {
    enroll?: (p: unknown) => Promise<{ message?: string }>;
    loading?: boolean;
  };
  const enroll = enrollmentResult.enroll;
  const enrollLoading: boolean = !!enrollmentResult.loading;

  // Derive branding from effectiveConfig without calling setState inside an effect
  const branding = useMemo<Branding>(
    () => ({
      // @ts-expect-error - effectiveConfig shape is dynamic and not statically typed
      font: (effectiveConfig as any)?.branding?.font,
      // @ts-expect-error - dynamic
      background: (effectiveConfig as any)?.branding?.background,
      // @ts-expect-error - dynamic
      color: (effectiveConfig as any)?.branding?.color,
      // @ts-expect-error - dynamic
      logo: (effectiveConfig as any)?.branding?.logo,
    }),
    [effectiveConfig],
  );

  const handleField = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const payload = { ...form } as unknown;
    const result = enroll ? await enroll(payload) : null;
    setEnrollResult((result as any)?.message || "Enrollment submitted.");
  };

  if (sessionState.status === "loading")
    return <div style={{ padding: 32 }}>Loading session...</div>;
  if (sessionState.status === "unauthenticated")
    return <div style={{ padding: 32 }}>Please sign in.</div>;

  // Use a key derived from effectiveConfig so the component remounts when config changes
  return (
    <div
      key={JSON.stringify(effectiveConfig)}
      style={{
        padding: 32,
        maxWidth: 900,
        margin: "0 auto",
        fontFamily: branding?.font || "inherit",
        background: branding?.background || "#fff",
        color: branding?.color || "#222",
      }}
    >
      <h1>Employee Benefit Enrollment</h1>
      <div style={{ marginBottom: 24 }}>
        <label>Select Plan: </label>
        <select value={planType} onChange={(e) => setPlanType(e.target.value)}>
          <option value="GMC">GMC</option>
          <option value="GPA">GPA</option>
          <option value="GTL">GTL</option>
          <option value="Flex">Flex</option>
          <option value="Wallet">Wallet</option>
          <option value="Custom">Custom</option>
        </select>
        <select
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          style={{ marginLeft: 16 }}
        >
          <option value="IN">India</option>
          <option value="SG">Singapore</option>
          <option value="AE">UAE</option>
          <option value="US">USA</option>
          <option value="GLOBAL">Global</option>
        </select>
      </div>
      {configLoading || enrollLoading ? (
        <div>Loading...</div>
      ) : effectiveConfig ? (
        <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
          <div style={{ flex: 2 }}>
            <FamilyDefinitionForm
              value={form.family}
              onChange={(v: any) => handleField("family", v)}
              config={effectiveConfig as any}
              branding={branding as any}
              errors={errors as any}
            />
            <SumInsuredSelector
              value={form.sumInsured}
              onChange={(v: any) => handleField("sumInsured", v)}
              config={effectiveConfig as any}
              branding={branding as any}
              errors={errors as any}
            />
            <PremiumMatrixTable
              config={effectiveConfig as any}
              selection={form as any}
              branding={branding as any}
            />
            <RiderOptions
              value={form.riders}
              onChange={(v: any) => handleField("riders", v)}
              config={effectiveConfig as any}
              branding={branding as any}
              errors={errors as any}
            />
            <WalletContributionSlider
              value={form.wallet}
              onChange={(v: any) => handleField("wallet", v)}
              config={effectiveConfig as any}
              branding={branding as any}
              errors={errors as any}
            />
            <PaymentMethodSelector
              value={form.payment}
              onChange={(v: any) => handleField("payment", v)}
              config={effectiveConfig as any}
              branding={branding as any}
              errors={errors as any}
            />
            <button
              onClick={handleSubmit}
              disabled={enrollLoading || !!enrollResult}
              style={{ marginTop: 24 }}
            >
              Submit Enrollment
            </button>
            {enrollResult && (
              <div style={{ marginTop: 24, color: "green" }}>
                {enrollResult}
              </div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 320 }}>
            <ProductSummaryCard
              config={effectiveConfig as any}
              selection={form as any}
              branding={branding as any}
            />
          </div>
        </div>
      ) : (
        <div>No plan configuration found.</div>
      )}
    </div>
  );
}
