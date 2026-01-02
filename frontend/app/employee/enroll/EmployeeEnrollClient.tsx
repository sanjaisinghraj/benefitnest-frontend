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
      font: (effectiveConfig as any)?.branding?.font,
      background: (effectiveConfig as any)?.branding?.background,
      color: (effectiveConfig as any)?.branding?.color,
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
    return <div className="p-4 sm:p-6 md:p-8">Loading session...</div>;
  if (sessionState.status === "unauthenticated")
    return <div className="p-4 sm:p-6 md:p-8">Please sign in.</div>;

  // Use a key derived from effectiveConfig so the component remounts when config changes
  return (
    <div
      key={JSON.stringify(effectiveConfig)}
      className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto"
      style={{
        fontFamily: branding?.font || "inherit",
        background: branding?.background || "#fff",
        color: branding?.color || "#222",
      }}
    >
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">Employee Benefit Enrollment</h1>
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm sm:text-base">Select Plan: </label>
          <select 
            value={planType} 
            onChange={(e) => setPlanType(e.target.value)}
            className="px-2 py-1.5 sm:px-3 sm:py-2 border rounded-lg text-sm sm:text-base"
          >
            <option value="GMC">GMC</option>
            <option value="GPA">GPA</option>
            <option value="GTL">GTL</option>
            <option value="Flex">Flex</option>
            <option value="Wallet">Wallet</option>
            <option value="Custom">Custom</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm sm:text-base">Country: </label>
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="px-2 py-1.5 sm:px-3 sm:py-2 border rounded-lg text-sm sm:text-base"
          >
            <option value="IN">India</option>
            <option value="SG">Singapore</option>
            <option value="AE">UAE</option>
            <option value="US">USA</option>
            <option value="GLOBAL">Global</option>
          </select>
        </div>
      </div>
      {configLoading || enrollLoading ? (
        <div className="py-8 text-center">Loading...</div>
      ) : effectiveConfig ? (
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8 items-start">
          <div className="flex-1 lg:flex-[2] w-full">
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
              className="mt-4 sm:mt-6 w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg font-semibold text-sm sm:text-base hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Enrollment
            </button>
            {enrollResult && (
              <div className="mt-4 sm:mt-6 text-green-600 text-sm sm:text-base">
                {enrollResult}
              </div>
            )}
          </div>
          <div className="w-full lg:flex-1 lg:min-w-[280px]">
            <ProductSummaryCard
              config={effectiveConfig as any}
              selection={form as any}
              branding={branding as any}
            />
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">No plan configuration found.</div>
      )}
    </div>
  );
}
