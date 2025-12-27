'use client';

export default function ComplianceConfig() {
  return (
    <div className="border rounded p-3">
      <h3 className="text-sm font-semibold mb-3">Compliance</h3>

      <div className="space-y-2">
        <textarea
          placeholder="Privacy / consent text"
          className="w-full border rounded px-2 py-1 text-sm"
          rows={3}
        />

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" />
          Consent required at login
        </label>
      </div>
    </div>
  );
}
