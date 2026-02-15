export interface UserInfo {
  name: string | null;
  email: string | null;
  sub: string | null;
}

const idTokenCookiePattern = /^CognitoIdentityServiceProvider\.[^.]+\.[^.]+\.idToken$/;

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const decoded = atob(`${normalized}${padding}`);
  const bytes = Uint8Array.from(decoded, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

export const getIdToken = () => {
  if (typeof document === "undefined") {
    return null;
  }
  const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
  for (const cookie of cookies) {
    if (!cookie) {
      continue;
    }
    const [name, value] = cookie.split("=");
    if (!name || !value) {
      continue;
    }
    if (idTokenCookiePattern.test(name)) {
      return decodeURIComponent(value);
    }
  }
  return null;
};

export const parseUserInfo = (token: string): UserInfo => {
  const parts = token.split(".");
  if (parts.length < 2) {
    return { name: null, email: null, sub: null };
  }
  try {
    const payload = JSON.parse(decodeBase64Url(parts[1]));
    return {
      name: typeof payload.name === "string" ? payload.name : null,
      email: typeof payload.email === "string" ? payload.email : null,
      sub: typeof payload.sub === "string" ? payload.sub : null,
    };
  } catch {
    return { name: null, email: null, sub: null };
  }
};
