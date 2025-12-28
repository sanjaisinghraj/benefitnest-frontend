export function useOverrides(config: any, countryCode: string) {
  if (!config) return config;
  let result = { ...config };
  if (config.country_overrides && config.country_overrides[countryCode]) {
    result = { ...result, ...config.country_overrides[countryCode] };
  }
  if (config.corporate_customizations) {
    result = { ...result, ...config.corporate_customizations };
  }
  return result;
}
