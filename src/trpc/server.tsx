import { cache } from "react";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  createTRPCOptionsProxy,
  type TRPCQueryOptions,
} from "@trpc/tanstack-react-query";
import "server-only";

import { createTRPCContext } from "./init";
import { makeQueryClient } from "./query-client";
import { appRouter } from "./routers/_app";

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(makeQueryClient);
export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});

// ...
export const caller = appRouter.createCaller(createTRPCContext);

export function prefetch<
  // biome-ignore lint/suspicious/noExplicitAny: matches any tRPC router query options
  T extends ReturnType<TRPCQueryOptions<any>>,
>(queryOptions: T) {
  const queryClient = getQueryClient();
  if (queryOptions.queryKey[1]?.type === "infinite") {
    // awaiting prefetch will do absolutely nothing useful (because it is always void). So, don't need to do const workflows = await prefetch(...)
    // biome-ignore lint/suspicious/noExplicitAny: infinite query options are not narrowed by the generic above
    void queryClient.prefetchInfiniteQuery(queryOptions as any);
  } else {
    void queryClient.prefetchQuery(queryOptions);
  }
}

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}
