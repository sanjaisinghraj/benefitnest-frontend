import React from "react";
export function FamilyDefinitionForm({
  value,
  onChange,
  config,
  branding,
  errors,
}: any) {
  const members = config?.family_definition?.members || [];
  return (
    <div style={{ ...branding }}>
      <h3>Family Members</h3>
      {members.map((m: any, idx: number) => (
        <div key={idx}>
          <label>
            {m.relation} {m.mandatory ? "*" : ""}
          </label>
          <input
            type="checkbox"
            checked={!!value[m.relation]}
            onChange={(e) =>
              onChange({ ...value, [m.relation]: e.target.checked })
            }
            disabled={m.mandatory}
          />
        </div>
      ))}
      {errors?.family && <div style={{ color: "red" }}>{errors.family}</div>}
    </div>
  );
}
