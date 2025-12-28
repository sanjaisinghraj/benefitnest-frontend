import React from "react";
export function WalletContributionSlider({ value, onChange, config, branding, errors }: any) {
  const min = config?.wallet_flex_integration?.min_contribution || 0;
  const max = config?.wallet_flex_integration?.max_contribution || 10000;
  return (
    <div style={{ ...branding }}>
      <h3>Wallet Contribution</h3>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
      <span>{value}</span>
      {errors?.wallet && <div style={{ color: "red" }}>{errors.wallet}</div>}
    </div>
  );
}
