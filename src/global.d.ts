import type { getRequest } from "./lib/cached";
import type { appointments, requestChildren, requests } from "./lib/db/schema";

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
  export type RequestRow = typeof requests.$inferSelect;
  export type NewRequestRow = typeof requests.$inferInsert;
  export type RequestChildRow = typeof requestChildren.$inferSelect;
  export type NewRequestChildRow = typeof requestChildren.$inferInsert;
  export type AppointmentRow = typeof appointments.$inferSelect;
  export type NewAppointmentRow = typeof appointments.$inferInsert;
}
