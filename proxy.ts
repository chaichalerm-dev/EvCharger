import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createPageSecurityHeaders } from "./src/config/security-headers";

export function proxy(request: NextRequest) {
  const nonce = crypto.randomUUID().replaceAll("-", "");
  const securityHeaders = createPageSecurityHeaders(
    nonce,
    process.env.NODE_ENV === "development",
  );
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("x-nonce", nonce);
  for (const header of securityHeaders) {
    requestHeaders.set(header.key, header.value);
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  for (const header of securityHeaders) {
    response.headers.set(header.key, header.value);
  }

  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
