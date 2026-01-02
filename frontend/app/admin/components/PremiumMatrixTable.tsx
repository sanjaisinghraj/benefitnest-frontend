import React from "react";

interface Props {
  value: any;
  onChange: (value: any) => void;
}

export const PremiumMatrixTable: React.FC<Props> = ({ value, onChange }) => {
  // Structure: { age_bands: ["0-18", "19-35", ...], si_list: [300000, 500000], premiums: { "0-18_300000": 1200, ... } }
  const data = value || { age_bands: ["0-18", "19-35", "36-45", "46-60", "61+"], si_list: [300000, 500000], premiums: {} };

  const handlePremiumChange = (band: string, si: number, amount: number) => {
    const key = `${band}_${si}`;
    onChange({
      ...data,
      premiums: {
        ...data.premiums,
        [key]: amount,
      },
    });
  };

  return (
    <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8, backgroundColor: "white", overflowX: "auto" }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Premium Matrix (Base)</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: 8, borderBottom: "2px solid #e5e7eb" }}>Age Band</th>
            {data.si_list.map((si: number) => (
              <th key={si} style={{ textAlign: "right", padding: 8, borderBottom: "2px solid #e5e7eb" }}>
                {(si / 100000).toFixed(1)}L
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.age_bands.map((band: string) => (
            <tr key={band}>
              <td style={{ padding: 8, borderBottom: "1px solid #f3f4f6", fontWeight: 500 }}>{band}</td>
              {data.si_list.map((si: number) => {
                const key = `${band}_${si}`;
                return (
                  <td key={si} style={{ padding: 8, borderBottom: "1px solid #f3f4f6" }}>
                    <input
                      type="number"
                      value={data.premiums[key] || ""}
                      onChange={(e) => handlePremiumChange(band, si, Number(e.target.value))}
                      placeholder="0"
                      style={{
                        width: "100%",
                        textAlign: "right",
                        padding: "4px 8px",
                        border: "1px solid #e5e7eb",
                        borderRadius: 4,
                      }}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
