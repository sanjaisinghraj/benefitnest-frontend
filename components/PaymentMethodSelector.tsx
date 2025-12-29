import React from "react";
export function PaymentMethodSelector({
  value,
  onChange,
  config,
  branding,
  errors,
}: any) {
  const methods = config?.payment_options?.methods || [];
  return (
    <div style={{ ...branding }}>
      <h3>Payment Method</h3>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {methods.map((m: string) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      {errors?.payment && <div style={{ color: "red" }}>{errors.payment}</div>}
    </div>
  );
}
