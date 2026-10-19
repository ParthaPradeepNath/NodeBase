import { useQuery } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";

export const useSubscription = () => {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const { data } = await authClient.customer.state();
      return data;
    },
  });
};

export const useHasActiveSubscription = () => {
  const { data: customerState, isLoading, ...rest } = useSubscription();

  const hasActiveSubscription =
    customerState?.active_subscriptions &&
    customerState.active_subscriptions.length > 0;

  return {
    hasActiveSubscription,
    subscription: customerState?.active_subscriptions?.[0],
    isLoading,
    ...rest,
  };
};
