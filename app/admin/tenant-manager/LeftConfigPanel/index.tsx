'use client';

import BrandIdentity from './BrandIdentity';
import LoginContent from './LoginContent';
import WidgetsConfig from './WidgetsConfig';
import DocumentsLinks from './DocumentsLinks';
import SupportConfig from './SupportConfig';
import ComplianceConfig from './ComplianceConfig';
import LocalizationConfig from './LocalizationConfig';

export default function LeftConfigPanel() {
  return (
    <div className="p-4 space-y-6">
      <BrandIdentity />
      <LoginContent />
      <WidgetsConfig />
      <DocumentsLinks />
      <SupportConfig />
      <ComplianceConfig />
      <LocalizationConfig />
    </div>
  );
}
