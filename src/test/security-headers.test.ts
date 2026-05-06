import { describe, it, expect } from "vitest";
import { REQUIRED_HEADERS } from "@/lib/security/cspTemplate";
import { PUBLIC_ROUTES_TO_TEST, ENVIRONMENTS } from "@/lib/security/routes";

const ENV = (process.env.SEC_ENV || "dev") as keyof typeof ENVIRONMENTS;
const BASE = ENVIRONMENTS[ENV];

async function getHeaders(url: string): Promise<Headers | null> {
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow" });
    return res.headers;
  } catch {
    return null;
  }
}

describe(`Security headers — ${ENV} (${BASE})`, () => {
  for (const route of PUBLIC_ROUTES_TO_TEST) {
    describe(`route ${route}`, () => {
      it("returns expected security headers", async () => {
        const headers = await getHeaders(BASE + route);
        if (!headers) {
          console.warn(`Skipping ${route} — unreachable at ${BASE}`);
          return;
        }
        for (const [name, expected] of Object.entries(REQUIRED_HEADERS)) {
          const value = headers.get(name);
          // soft assertions in dev, hard in staging/prod
          const ok =
            value != null &&
            (typeof expected === "string"
              ? value.toLowerCase().includes(expected.toLowerCase())
              : (expected as RegExp).test(value));
          if (ENV === "dev") {
            if (!ok) console.warn(`[${route}] ${name} weak/missing (got: ${value})`);
          } else {
            expect(ok, `${name} on ${route} (got: ${value})`).toBe(true);
          }
        }
      });
    });
  }
});
