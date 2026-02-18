import { getIdToken, parseUserInfo } from "@/lib/auth";

const ensureTextEncoderDecoder = () => {
  if (typeof TextDecoder === "undefined" || typeof TextEncoder === "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { TextDecoder: NodeTextDecoder, TextEncoder: NodeTextEncoder } = require("util");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).TextDecoder = NodeTextDecoder;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).TextEncoder = NodeTextEncoder;
  }
};

const base64UrlEncode = (value: string) => {
  const bytes = new TextEncoder().encode(value);
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const clearCookies = () => {
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0]?.trim();
    if (!name) {
      return;
    }
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });
};

describe("auth utilities", () => {
  beforeEach(() => {
    ensureTextEncoderDecoder();
    clearCookies();
  });

  it("returns null when no id token cookie exists", () => {
    document.cookie = "foo=bar";

    expect(getIdToken()).toBeNull();
  });

  it("finds an id token from Cognito cookies", () => {
    const token = "header.payload.signature";
    document.cookie = "foo=bar";
    document.cookie =
      "CognitoIdentityServiceProvider.1smomg9sbgg1f4000c65r22gug.796e14e8-0081-70cf-1b88-72c3f42d38b1.idToken=" +
      encodeURIComponent(token);

    expect(getIdToken()).toBe(token);
  });

  it("parses user info from the JWT payload", () => {
    const payload = {
      name: "Ada Lovelace",
      email: "ada@example.com",
      sub: "user-123",
      exp: 1700000000,
    };
    const token = `header.${base64UrlEncode(JSON.stringify(payload))}.sig`;

    expect(parseUserInfo(token)).toEqual(payload);
  });
});
