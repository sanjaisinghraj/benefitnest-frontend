import React from "react";

interface Props {
  value: any[];
  onChange: (value: any[]) => void;
}

export const RiderOptions: React.FC<Props> = ({ value, onChange }) => {
  const riders = value || [
    { id: "mat", name: "Maternity", enabled: false, limit: 50000 },
    { id: "opd", name: "OPD Cover", enabled: false, limit: 10000 },
    { id: "ci", name: "Critical Illness", enabled: false, limit: 200000 },
    { id: "pa", name: "Personal Accident", enabled: false, limit: 500000 },
  ];

  const toggle = (index: number) => {
    const updated = [...riders];
    updated[index].enabled = !updated[index].enabled;
    onChange(updated);
  };

  const updateLimit = (index: number, val: number) => {
    const updated = [...riders];
    updated[index].limit = val;
    onChange(updated);
  };

  return (
    <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8, backgroundColor: "white" }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Rider Configuration</h3>
      <div style={{ display: "grid", gap: 12 }}>
        {riders.map((r, idx) => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: 8, border: "1px solid #f3f4f6", borderRadius: 6 }}>
            <input
              type="checkbox"
              checked={r.enabled}
              onChange={() => toggle(idx)}
              style={{ width: 16, height: 16 }}
            />
            <div style={{ flex: 1, fontWeight: 500 }}>{r.name}</div>
            {r.enabled && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#6b7280" }}>Limit:</span>
                <input
                  type="number"
                  value={r.limit}
                  onChange={(e) => updateLimit(idx, Number(e.target.value))}
                  style={{ width: 100, padding: 4, border: "1px solid #d1d5db", borderRadius: 4 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
