import React from "react";
export function PremiumMatrixTable({ config, selection, branding }: any) {
  const matrix = config?.premium_matrix;
  if (!matrix) return null;
  return (
    <div style={{ ...branding }}>
      <h3>Premium Matrix</h3>
      <table>
        <thead>
          <tr>
            <th>Age Band</th>
            <th>Family Size</th>
            <th>Premium</th>
          </tr>
        </thead>
        <tbody>
          {matrix.premiums?.map((row: any, idx: number) => (
            <tr
              key={idx}
              style={
                selection?.age_band === row.age_band &&
                selection?.family_size === row.family_size
                  ? { background: "#e0f7fa" }
                  : {}
              }
            >
              <td>{row.age_band}</td>
              <td>{row.family_size}</td>
              <td>{row.premium.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
