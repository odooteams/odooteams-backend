export const PUBLIC_ROUTES_TO_TEST = [
  "/",
  "/about",
  "/services",
  "/projects",
  "/contact",
  "/faqs",
  "/learn-odoo",
  "/auth/signin",
];

export const ENVIRONMENTS = {
  dev: "http://localhost:5173",
  staging: import.meta?.env?.VITE_STAGING_URL || "https://staging.odooteams.com",
  prod: import.meta?.env?.VITE_PROD_URL || "https://odooteams.com",
};
