'use client';

import { useTenantConfigContext } from '../TenantConfigContext';

export default function BrandIdentity() {
  const { config, update } = useTenantConfigContext();

  return (
    <div className="border rounded p-3">
      <h3 className="text-sm font-semibold mb-3">Brand Identity</h3>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Primary Color (e.g. #1E40AF)"
          value={config.branding.primaryColor}
          onChange={(e) =>
            update('branding.primaryColor', e.target.value)
          }
          className="w-full border rounded px-2 py-1 text-sm"
        />

        <input
          type="text"
          placeholder="Secondary Color"
          value={config.branding.secondaryColor}
          onChange={(e) =>
            update('branding.secondaryColor', e.target.value)
          }
          className="w-full border rounded px-2 py-1 text-sm"
        />
      </div>
    </div>
  );
}
