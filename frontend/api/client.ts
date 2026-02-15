import { useAuthStore } from "@/store/authStore";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not set.");
}
const useDemoAuth = process.env.NEXT_PUBLIC_USE_DEMO_AUTH === "true";
const defaultHeaders = {
  "Content-Type": "application/json",
};

type QueryParams = Record<string, string | number | boolean | null | undefined>;

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  query?: QueryParams;
}

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
    const idToken = useAuthStore.getState().idToken;
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
