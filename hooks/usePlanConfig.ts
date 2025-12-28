import { useState, useEffect } from "react";
import { gql, useApolloClient } from "@apollo/client";

export function usePlanConfig(planType: string, corporateId: string, countryCode = "IN") {
  const client = useApolloClient();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!planType || !corporateId) return;
    setLoading(true);
    client
      .query({
        query: gql`
          query GetConfig($planType: String!, $corporateId: String!, $countryCode: String!) {
            getConfig(planType: $planType, corporateId: $corporateId, countryCode: $countryCode) {
              ... on ConfigType { configJson }
            }
          }
        `,
        variables: { planType, corporateId, countryCode },
        fetchPolicy: "cache-first"
      })
      .then(res => setConfig(res.data?.getConfig?.configJson || null))
      .finally(() => setLoading(false));
  }, [planType, corporateId, countryCode]);

  return { config, loading };
}
