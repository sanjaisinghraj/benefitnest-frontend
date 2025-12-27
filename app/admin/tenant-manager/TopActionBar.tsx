'use client';

import TenantSelector from './TenantSelector';
import { useTenantConfigContext } from './TenantConfigContext';

export default function TopActionBar() {
  const { config } = useTenantConfigContext();

  async function handleSave() {
    await fetch('/api/admin/tenant-ui-config/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: 'abc', // make dynamic later
        config,
      }),
    });
  }

  return (
    <div className="h-16 flex items-center justify-between px-4 border-b bg-white">
      {/* Left */}
      <div className="flex items-center gap-4">
        <TenantSelector />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <button className="px-3 py-1 text-sm border rounded">
          AI Review
        </button>

        <button
          onClick={handleSave}
          className="px-3 py-1 text-sm border rounded"
        >
          Save
        </button>

        <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
          Publish
        </button>
      </div>
    </div>
  );
}
