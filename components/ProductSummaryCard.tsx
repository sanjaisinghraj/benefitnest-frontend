import React from "react";
export function ProductSummaryCard({ config, selection, branding }: any) {
  // Compute summary from config + selection
  return (
    <div style={{ ...branding, border: '1px solid #eee', borderRadius: 8, padding: 16, marginTop: 24 }}>
      <h3>Product Summary</h3>
      {/* Render summary: plans, dependents, premiums, deductions, EMI, etc. */}
      <pre style={{ fontSize: 12 }}>{JSON.stringify({ config, selection }, null, 2)}</pre>
    </div>
  );
}
