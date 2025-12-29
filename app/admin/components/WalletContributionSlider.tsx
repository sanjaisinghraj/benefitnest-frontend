import React from "react";

interface Props {
  value: number; // Employer contribution percentage
  onChange: (value: number) => void;
}

export const WalletContributionSlider: React.FC<Props> = ({ value, onChange }) => {
  const val = value ?? 50;

  return (
    <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8, backgroundColor: "white" }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Wallet Contribution</h3>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
          <span>Employee: <strong>{100 - val}%</strong></span>
          <span>Employer: <strong>{val}%</strong></span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={val}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ width: "100%", cursor: "pointer" }}
        />
      </div>
      <div style={{ fontSize: 12, color: "#6b7280", fontStyle: "italic" }}>
        Define the percentage of premium borne by the employer vs employee.
      </div>
    </div>
  );
};
