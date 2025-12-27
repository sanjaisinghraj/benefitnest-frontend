'use client';

import { ReactNode } from 'react';

export default function TenantManagerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="h-screen w-full flex flex-col bg-white">
      {children}
    </div>
  );
}
