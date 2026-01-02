import React from "react";
export function RiderOptions({
  value,
  onChange,
  config,
  branding,
  errors,
}: any) {
  const riders = config?.riders || [];
  return (
    <div style={{ ...branding }}>
      <h3>Rider Options</h3>
      {riders.map((r: any, idx: number) => (
        <div key={idx}>
          <label>{r.name}</label>
          <input
            type="checkbox"
            checked={!!value[r.name]}
            onChange={(e) => onChange({ ...value, [r.name]: e.target.checked })}
          />
        </div>
      ))}
      {errors?.riders && <div style={{ color: "red" }}>{errors.riders}</div>}
    </div>
  );
}
