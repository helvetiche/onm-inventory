import { createSecureHeaders } from "next-secure-headers";

export const securityHeaders = createSecureHeaders({
  forceHTTPSRedirect: [
    true,
    {
      maxAge: 60 * 60 * 24 * 365,
      includeSubDomains: true,
      preload: true,
    },
  ],
  referrerPolicy: "strict-origin-when-cross-origin",
  frameGuard: "deny",
  noopen: "noopen",
  nosniff: "nosniff",
  xssProtection: "sanitize",
});

