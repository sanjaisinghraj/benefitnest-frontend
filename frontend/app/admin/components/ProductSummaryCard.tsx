import React from "react";

interface Props {
  config: any;
  selection: any;
  branding: any;
}

export const ProductSummaryCard: React.FC<Props> = ({ config, selection, branding }) => {
  return (
    <div
      style={{
        backgroundColor: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 24,
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0 }}>
            {selection.name || "Plan Name Preview"}
          </h3>
          <p style={{ color: "#6b7280", fontSize: 14, marginTop: 4 }}>
            {selection.policy_number || "Policy No."}
          </p>
        </div>
        <div
          style={{
            padding: "4px 12px",
            backgroundColor: "#dbeafe",
            color: "#1e40af",
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {selection.status || "DRAFT"}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 14 }}>
        <div>
          <span style={{ color: "#6b7280" }}>Start Date:</span>
          <div style={{ fontWeight: 500 }}>{selection.start_date || "-"}</div>
        </div>
        <div>
          <span style={{ color: "#6b7280" }}>End Date:</span>
          <div style={{ fontWeight: 500 }}>{selection.end_date || "-"}</div>
        </div>
        <div>
          <span style={{ color: "#6b7280" }}>Insurer:</span>
          <div style={{ fontWeight: 500 }}>{selection.insurer_id || "-"}</div>
        </div>
        <div>
          <span style={{ color: "#6b7280" }}>TPA:</span>
          <div style={{ fontWeight: 500 }}>{selection.tpa_id || "-"}</div>
        </div>
      </div>

      <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #f3f4f6" }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
          Configuration Summary
        </h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {/* Placeholder for dynamic config tags */}
          <span style={{ padding: "2px 8px", backgroundColor: "#f3f4f6", borderRadius: 4, fontSize: 12 }}>
            Standard Cover
          </span>
        </div>
      </div>
    </div>
  );
};
