import { useState } from "react";
import { gql, useApolloClient } from "@apollo/client";

export function useEnrollment(planType: string, corporateId: string) {
  const client = useApolloClient();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const enroll = async (formData: any) => {
    setLoading(true);
    try {
      const res = await client.mutate({
        mutation: gql`
          mutation TriggerEnrollment($planType: String!, $corporateId: String!, $input: JSON!) {
            triggerEnrollment(planType: $planType, corporateId: $corporateId, input: $input) {
              message
              status
            }
          }
        `,
        variables: { planType, corporateId, input: formData }
      });
      setResult(res.data?.triggerEnrollment);
      return res.data?.triggerEnrollment;
    } finally {
      setLoading(false);
    }
  };

  return { enroll, loading, result };
}
