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

// delay for smooth token refresh
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const apiFetch = async (path: string, options: ApiRequestOptions = {}) => {
  const url = buildUrl(path, options.query);
  // normalize body for fetch (either FormData or JSON)
  const bodySource = options.body;
  const isFormData =
    typeof FormData !== "undefined" && bodySource instanceof FormData;
  let body: BodyInit | undefined;
  if (isFormData) {
    body = bodySource;
  } else if (bodySource) {
    body = JSON.stringify(bodySource);
  }
  const buildRequestInit = () => {
    const headers: Record<string, string> = isFormData
      ? {}
      : { ...defaultHeaders };
    const idToken = getIdToken();
    if (idToken) {
      headers.Authorization = `Bearer ${idToken}`;
    }
    return {
      method: options.method ?? "GET",
      headers,
      body,
    } satisfies RequestInit;
  };
  const requestInit = buildRequestInit();

  const response = await fetch(url, requestInit);
  // if not 401 or not in browser, return response
  if (response.status !== 401 || typeof window === "undefined") {
    return response;
  }
  // delay for smooth token refresh
  await delay(200);
  // re-build request with new token
  const retryResponse = await fetch(url, buildRequestInit());
  // if still 401, reload the page
  if (retryResponse.status === 401) {
    window.location.reload();
  }

  return retryResponse;
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
