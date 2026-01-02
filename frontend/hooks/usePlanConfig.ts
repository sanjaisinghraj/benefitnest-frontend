import { useState, useEffect } from "react";
import { gql } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";

export function usePlanConfig(
  planType: string,
  corporateId: string,
  countryCode = "IN",
) {
  const client = useApolloClient();
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    if (!planType || !corporateId) return;
    client
      .query({
        query: gql`
          query GetConfig(
            $planType: String!
            $corporateId: String!
            $countryCode: String!
          ) {
            getConfig(
              planType: $planType
              corporateId: $corporateId
              countryCode: $countryCode
            ) {
              ... on ConfigType {
                configJson
              }
            }
          }
        `,
        variables: { planType, corporateId, countryCode },
        fetchPolicy: "cache-first",
      })
      .then((res) => {
        // Type guard for res.data
        const data = (res.data as { getConfig?: { configJson?: any } }) || {};
        setConfig(data.getConfig?.configJson || null);
      });
  }, [planType, corporateId, countryCode]);

  return { config, loading: false };
}
