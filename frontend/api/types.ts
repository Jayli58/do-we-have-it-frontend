export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  query?: QueryParams;
}
