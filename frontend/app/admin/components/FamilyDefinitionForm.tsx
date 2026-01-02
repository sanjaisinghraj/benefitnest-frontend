import React from "react";

interface Props {
  value: any;
  onChange: (value: any) => void;
}

export const FamilyDefinitionForm: React.FC<Props> = ({ value, onChange }) => {
  const data = value || {
    self: true,
    spouse: true,
    children: true,
    parents: false,
    min_age: 18,
    max_age: 65,
    max_children: 2,
  };

  const handleChange = (field: string, val: any) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8, backgroundColor: "white" }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Family Definition</h3>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={data.self}
            onChange={(e) => handleChange("self", e.target.checked)}
          />
          <span>Self (Employee)</span>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={data.spouse}
            onChange={(e) => handleChange("spouse", e.target.checked)}
          />
          <span>Spouse</span>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={data.children}
            onChange={(e) => handleChange("children", e.target.checked)}
          />
          <span>Children</span>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={data.parents}
            onChange={(e) => handleChange("parents", e.target.checked)}
          />
          <span>Parents / In-laws</span>
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "#6b7280" }}>Min Entry Age</label>
          <input
            type="number"
            value={data.min_age}
            onChange={(e) => handleChange("min_age", Number(e.target.value))}
            style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "#6b7280" }}>Max Entry Age</label>
          <input
            type="number"
            value={data.max_age}
            onChange={(e) => handleChange("max_age", Number(e.target.value))}
            style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "#6b7280" }}>Max Children</label>
          <input
            type="number"
            value={data.max_children}
            onChange={(e) => handleChange("max_children", Number(e.target.value))}
            style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }}
          />
        </div>
      </div>
    </div>
  );
};
