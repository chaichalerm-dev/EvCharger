import { describe, expect, it } from "vitest";

import {
  BASE_SECURITY_HEADERS,
  createContentSecurityPolicy,
  createPageSecurityHeaders,
} from "@/src/config/security-headers";

describe("production security headers", () => {
  it("includes every header required for a SecurityHeaders A+ scan", () => {
    const names = new Set(
      createPageSecurityHeaders("testnonce").map(({ key }) => key.toLowerCase()),
    );

    for (const requiredHeader of [
      "content-security-policy",
      "strict-transport-security",
      "x-content-type-options",
      "x-frame-options",
      "referrer-policy",
      "permissions-policy",
    ]) {
      expect(names.has(requiredHeader), requiredHeader).toBe(true);
    }
  });

  it("uses a nonce-based production CSP without unsafe script execution", () => {
    const policy = createContentSecurityPolicy("testnonce");

    expect(policy).toContain("script-src 'self' 'nonce-testnonce' 'strict-dynamic'");
    expect(policy).toContain("script-src-attr 'none'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("upgrade-insecure-requests");
    expect(policy).not.toContain("'unsafe-eval'");
    expect(policy).not.toMatch(/script-src[^;]*'unsafe-inline'/);
  });

  it("keeps configurable HTTPS data providers available without allowing external scripts", () => {
    const policy = createContentSecurityPolicy("testnonce");

    expect(policy).toContain("connect-src 'self' https:");
    expect(policy).toContain("img-src 'self' data: blob: https:");
    expect(policy).not.toMatch(/script-src[^;]*https:/);
  });

  it("uses long-lived HTTPS enforcement and restrictive legacy fallbacks", () => {
    const headers = Object.fromEntries(
      BASE_SECURITY_HEADERS.map(({ key, value }) => [key.toLowerCase(), value]),
    );

    expect(headers["strict-transport-security"]).toBe(
      "max-age=63072000; includeSubDomains; preload",
    );
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-xss-protection"]).toBe("0");
  });
});
