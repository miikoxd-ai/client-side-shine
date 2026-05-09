import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "render",
    defaultPreloadStaleTime: 1000 * 60 * 5,
    defaultPreloadGcTime: 1000 * 60 * 30,
  });

  return router;
};
