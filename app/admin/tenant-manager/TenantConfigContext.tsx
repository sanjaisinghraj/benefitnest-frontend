'use client';

import { createContext, useContext } from 'react';
import { useTenantConfig } from './hooks/useTenantConfig';

type TenantConfigContextType = ReturnType<typeof useTenantConfig>;

export const TenantConfigContext =
  createContext<TenantConfigContextType | null>(null);

export function useTenantConfigContext() {
  const ctx = useContext(TenantConfigContext);
  if (!ctx) throw new Error('TenantConfigContext missing');
  return ctx;
}
