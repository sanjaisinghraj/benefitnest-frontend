import React from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export const PaymentMethodSelector: React.FC<Props> = ({ value, onChange }) => {
  const options = [
    { id: "PREPAID_WALLET", label: "Prepaid Wallet", desc: "Deduct from employer wallet" },
    { id: "POSTPAID_INVOICE", label: "Postpaid Invoice", desc: "Monthly invoice settlement" },
    { id: "DIRECT_DEBIT", label: "Direct Debit", desc: "Auto-debit from bank account" },
  ];

  return (
    <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8, backgroundColor: "white" }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Payment Method</h3>
      <div style={{ display: "grid", gap: 12 }}>
        {options.map((opt) => (
          <label
            key={opt.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: 12,
              border: value === opt.id ? "2px solid #2563eb" : "1px solid #e5e7eb",
              borderRadius: 8,
              cursor: "pointer",
              backgroundColor: value === opt.id ? "#eff6ff" : "white",
            }}
          >
            <input
              type="radio"
              name="payment_method"
              value={opt.id}
              checked={value === opt.id}
              onChange={(e) => onChange(e.target.value)}
              style={{ marginTop: 4 }}
            />
            <div>
              <div style={{ fontWeight: 600, color: "#1f2937" }}>{opt.label}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{opt.desc}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};
