'use client';

import { useState } from 'react';

export type TenantUIConfig = {
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
  };
  loginPage: {
    heading: string;
    subheading: string;
    backgroundUrl: string;
  };
  widgets: {
    announcement: boolean;
    poll: boolean;
    survey: boolean;
  };
  localization: {
    defaultLanguage: string;
    supportedLanguages: string;
  };
};

const defaultConfig: TenantUIConfig = {
  branding: {
    primaryColor: '',
    secondaryColor: '',
  },
  loginPage: {
    heading: '',
    subheading: '',
    backgroundUrl: '',
  },
  widgets: {
    announcement: false,
    poll: false,
    survey: false,
  },
  localization: {
    defaultLanguage: 'en',
    supportedLanguages: 'en',
  },
};

export function useTenantConfig() {
  const [config, setConfig] = useState<TenantUIConfig>(defaultConfig);

  function update(path: string, value: any) {
    setConfig(prev => {
      const copy: any = { ...prev };
      const keys = path.split('.');
      let ref = copy;

      keys.slice(0, -1).forEach(k => {
        ref[k] = { ...ref[k] };
        ref = ref[k];
      });

      ref[keys[keys.length - 1]] = value;
      return copy;
    });
  }

  return { config, update };
}
