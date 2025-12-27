'use client';

import { useTenantConfigContext } from '../TenantConfigContext';

export default function LoginContent() {
  const { config, update } = useTenantConfigContext();

  return (
    <div className="border rounded p-3">
      <h3 className="text-sm font-semibold mb-3">Login Page Content</h3>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Heading text"
          value={config.loginPage.heading}
          onChange={(e) =>
            update('loginPage.heading', e.target.value)
          }
          className="w-full border rounded px-2 py-1 text-sm"
        />

        <input
          type="text"
          placeholder="Subheading text"
          value={config.loginPage.subheading}
          onChange={(e) =>
            update('loginPage.subheading', e.target.value)
          }
          className="w-full border rounded px-2 py-1 text-sm"
        />

        <input
          type="text"
          placeholder="Background image / video URL"
          value={config.loginPage.backgroundUrl}
          onChange={(e) =>
            update('loginPage.backgroundUrl', e.target.value)
          }
          className="w-full border rounded px-2 py-1 text-sm"
        />
      </div>
    </div>
  );
}
