import React from "react";
export function SumInsuredSelector({ value, onChange, config, branding, errors }: any) {
  const options = config?.sum_insured_logic?.options || [];
  return (
    <div style={{ ...branding }}>
      <h3>Sum Insured</h3>
      <select value={value} onChange={e => onChange(Number(e.target.value))}>
        {options.map((opt: number) => (
          <option key={opt} value={opt}>{opt.toLocaleString()}</option>
        ))}
      </select>
      {errors?.sumInsured && <div style={{ color: "red" }}>{errors.sumInsured}</div>}
    </div>
  );
}
