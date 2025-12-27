'use client';

import { useEffect, useRef } from 'react';
import { useTenantConfigContext } from '../TenantConfigContext';

export default function IframePreview() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { config } = useTenantConfigContext();

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'TENANT_UI_CONFIG_UPDATE', payload: config },
      '*'
    );
  }, [config]);

  return (
    <iframe
      ref={iframeRef}
      src="https://abc.benefitspace.space/login"
      className="w-full h-full border rounded bg-white"
      sandbox="allow-scripts allow-same-origin"
    />
  );
}
