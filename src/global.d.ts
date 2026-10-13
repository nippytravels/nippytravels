import type { getRequest } from "./lib/cached";

declare global {
  type Status = (typeof requestStatus.enumValues)[number];
  type SearchParams = Promise<{
    page?: string;
    status?: string;
    q?: string;
    id?: string;
  }>;
  type Params = Awaited<SearchParams>;
  type RequestDetail = NonNullable<Awaited<ReturnType<typeof getRequest>>>;
}
