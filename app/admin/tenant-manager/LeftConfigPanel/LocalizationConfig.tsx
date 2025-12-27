'use client';

import { useTenantConfigContext } from '../TenantConfigContext';

export default function LocalizationConfig() {
  const { config, update } = useTenantConfigContext();

  return (
    <div className="border rounded p-3">
      <h3 className="text-sm font-semibold mb-3">Language & Localization</h3>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Default language (e.g. en)"
          value={config.localization.defaultLanguage}
          onChange={(e) =>
            update('localization.defaultLanguage', e.target.value)
          }
          className="w-full border rounded px-2 py-1 text-sm"
        />

        <input
          type="text"
          placeholder="Supported languages (e.g. en,hi)"
          value={config.localization.supportedLanguages}
          onChange={(e) =>
            update('localization.supportedLanguages', e.target.value)
          }
          className="w-full border rounded px-2 py-1 text-sm"
        />
      </div>
    </div>
  );
}
