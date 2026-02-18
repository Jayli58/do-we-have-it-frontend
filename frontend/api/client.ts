import type { ApiRequestOptions, QueryParams } from "@/api/types";
import { getIdToken, isTokenExpiringSoon } from "@/lib/auth";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const useDemoAuth = process.env.NEXT_PUBLIC_USE_DEMO_AUTH === "true";
const defaultHeaders = {
  "Content-Type": "application/json",
};
const refreshAttemptKey = "dwhi-refresh-attempted";

const buildUrl = (path: string, query?: QueryParams) => {
  const url = new URL(path, baseUrl);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
};

export const apiFetch = (path: string, options: ApiRequestOptions = {}) => {
  const headers: Record<string, string> = { ...defaultHeaders };
  if (useDemoAuth) {
    headers["X-User-Id"] = "demo-user";
  } else {
    // token expiry check and refresh logic
    const idToken = getIdToken();
    // ensure we only run in the browser
    if (typeof window !== "undefined") {
      const shouldRefresh = !idToken || isTokenExpiringSoon(idToken);
      if (shouldRefresh) {
        const hasAttempted = sessionStorage.getItem(refreshAttemptKey) === "true";
        if (!idToken) {
          window.location.assign("/signout");
          return Promise.reject(new Error("Auth token missing"));
        }
        if (!hasAttempted) {
          sessionStorage.setItem(refreshAttemptKey, "true");
          window.location.reload();
          return Promise.reject(new Error("Auth refresh in progress"));
        }
        window.location.assign("/signout");
        return Promise.reject(new Error("Auth refresh failed"));
      }
      sessionStorage.removeItem(refreshAttemptKey);
    }
    if (idToken) {
      headers.Authorization = `Bearer ${idToken}`;
    }
  }
  return fetch(buildUrl(path, options.query), {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
};

export const parseJson = async <T>(response: Response) => {
  if (response.status === 204) {
    return null as T;
  }
  const text = await response.text();
  if (!text) {
    return null as T;
  }
  return JSON.parse(text) as T;
};

export const parseErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();
    if (data?.error?.message) {
      return data.error.message as string;
    }
  } catch {
    // ignore parse errors
  }
  return `Request failed with status ${response.status}.`;
};
