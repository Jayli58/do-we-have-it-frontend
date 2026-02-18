import type { ApiRequestOptions, QueryParams } from "@/api/types";

export type PendingRequest = {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  query?: QueryParams;
  body?: string | null;
  timestamp: number;
};

const pendingRequestKey = "dwhi-pending-request";

export const serializePendingRequest = (
  path: string,
  options: ApiRequestOptions
): PendingRequest => ({
  path,
  method: options.method ?? "GET",
  query: options.query,
  body: options.body ? JSON.stringify(options.body) : null,
  timestamp: Date.now(),
});

export const savePendingRequest = (path: string, options: ApiRequestOptions) => {
  if (typeof window === "undefined") {
    return;
  }
  const payload = serializePendingRequest(path, options);
  sessionStorage.setItem(pendingRequestKey, JSON.stringify(payload));
};

export const loadPendingRequest = () => {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = sessionStorage.getItem(pendingRequestKey);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as PendingRequest;
  } catch {
    sessionStorage.removeItem(pendingRequestKey);
    return null;
  }
};

export const clearPendingRequest = () => {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.removeItem(pendingRequestKey);
};

export const isSameRequest = (
  pending: PendingRequest,
  path: string,
  options: ApiRequestOptions
) => {
  const method = options.method ?? "GET";
  const body = options.body ? JSON.stringify(options.body) : null;
  return (
    pending.path === path &&
    pending.method === method &&
    JSON.stringify(pending.query ?? null) === JSON.stringify(options.query ?? null) &&
    (pending.body ?? null) === body
  );
};

export const replayPendingRequest = (
  pending: PendingRequest,
  buildUrl: (path: string, query?: QueryParams) => string,
  defaultHeaders: Record<string, string>
) => {
  void fetch(buildUrl(pending.path, pending.query), {
    method: pending.method,
    headers: defaultHeaders,
    body: pending.body ?? undefined,
  });
};
