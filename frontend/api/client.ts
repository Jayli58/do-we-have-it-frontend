import type { ApiRequestOptions, QueryParams } from "@/api/types";
import { getIdToken } from "@/lib/auth";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const defaultHeaders = {
  "Content-Type": "application/json",
};

const buildUrl = (path: string, query?: QueryParams) => {
  const normalizedBaseUrl = baseUrl?.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(normalizedPath, normalizedBaseUrl);

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
  const idToken = getIdToken();
  if (idToken) {
    headers.Authorization = `Bearer ${idToken}`;
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
