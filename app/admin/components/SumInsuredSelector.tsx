import React, { useState } from "react";

interface Props {
  value: number[];
  onChange: (value: number[]) => void;
}

export const SumInsuredSelector: React.FC<Props> = ({ value, onChange }) => {
  const list = value || [];
  const [newValue, setNewValue] = useState("");

  const add = () => {
    const num = Number(newValue);
    if (num > 0 && !list.includes(num)) {
      const updated = [...list, num].sort((a, b) => a - b);
      onChange(updated);
      setNewValue("");
    }
  };

  const remove = (val: number) => {
    onChange(list.filter((x) => x !== val));
  };

  return (
    <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8, backgroundColor: "white" }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Sum Insured Options</h3>
      
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          type="number"
          placeholder="Add amount (e.g. 500000)"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          style={{ flex: 1, padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6 }}
        />
        <button
          onClick={add}
          style={{
            padding: "8px 16px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Add
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {list.map((amt) => (
          <div
            key={amt}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              backgroundColor: "#f3f4f6",
              borderRadius: 20,
              fontSize: 14,
            }}
          >
            <span>{amt.toLocaleString()}</span>
            <button
              onClick={() => remove(amt)}
              style={{
                border: "none",
                background: "transparent",
                color: "#ef4444",
                cursor: "pointer",
                padding: 0,
                fontSize: 16,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        ))}
        {list.length === 0 && (
          <span style={{ color: "#9ca3af", fontStyle: "italic" }}>No options added</span>
        )}
      </div>
    </div>
  );
};
