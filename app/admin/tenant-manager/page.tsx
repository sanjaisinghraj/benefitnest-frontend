'use client';

import TenantManagerLayout from './TenantManagerLayout';
import TopActionBar from './TopActionBar';
import LeftConfigPanel from './LeftConfigPanel';
import PreviewPanel from './PreviewPanel';
import AIReviewDrawer from './AIReviewDrawer';

import { useTenantConfig } from './hooks/useTenantConfig';
import { TenantConfigContext } from './TenantConfigContext';

export default function TenantManagerPage() {
  const tenantConfig = useTenantConfig(); // ✅ hook inside component

  return (
    <TenantConfigContext.Provider value={tenantConfig}>
      <TenantManagerLayout>
        <TopActionBar />

        <div className="flex h-[calc(100vh-64px)]">
          {/* Left config panel */}
          <div className="w-[380px] border-r overflow-y-auto">
            <LeftConfigPanel />
          </div>

          {/* Right preview panel */}
          <div className="flex-1 bg-gray-50">
            <PreviewPanel />
          </div>
        </div>

        <AIReviewDrawer />
      </TenantManagerLayout>
    </TenantConfigContext.Provider>
  );
}
