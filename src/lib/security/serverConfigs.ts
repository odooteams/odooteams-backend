// Generates Nginx and Cloudflare configuration snippets that set the recommended
// security headers. Used by the Security admin "Server Config" tab.

import { RECOMMENDED_CSP, buildCspString } from "./cspTemplate";

export interface ServerConfigOpts {
  domain: string;
  csp?: string;
  hstsMaxAge?: number;
  includeSubdomains?: boolean;
  preload?: boolean;
}

const DEFAULTS = {
  hstsMaxAge: 63072000, // 2 years
  includeSubdomains: true,
  preload: true,
};

export function generateNginxConfig(opts: ServerConfigOpts): string {
  const o = { ...DEFAULTS, ...opts };
  const csp = o.csp || buildCspString(RECOMMENDED_CSP);
  const hsts =
    `max-age=${o.hstsMaxAge}` +
    (o.includeSubdomains ? "; includeSubDomains" : "") +
    (o.preload ? "; preload" : "");

  return `# ---------------------------------------------------------------
# Nginx security + SEO snippet for ${o.domain}
# Drop into your server { } block (or include from /etc/nginx/snippets/).
# Reload nginx after editing:  sudo nginx -t && sudo systemctl reload nginx
# ---------------------------------------------------------------

server {
    listen 443 ssl http2;
    server_name ${o.domain} www.${o.domain};

    # --- TLS (replace with your cert paths) ---
    ssl_certificate     /etc/letsencrypt/live/${o.domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${o.domain}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;

    # --- Security headers ---
    add_header Strict-Transport-Security "${hsts}" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;
    add_header Cross-Origin-Resource-Policy "same-origin" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "${csp}" always;

    # --- Compression ---
    gzip on;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss image/svg+xml;
    gzip_min_length 256;

    # --- Cache static assets ---
    location ~* \\.(?:css|js|woff2?|ttf|eot|otf|png|jpe?g|gif|svg|ico|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # --- SPA fallback ---
    root /var/www/${o.domain};
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# --- HTTP -> HTTPS + non-www redirect (SEO canonicalization) ---
server {
    listen 80;
    server_name ${o.domain} www.${o.domain};
    return 301 https://${o.domain}$request_uri;
}
server {
    listen 443 ssl http2;
    server_name www.${o.domain};
    ssl_certificate     /etc/letsencrypt/live/${o.domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${o.domain}/privkey.pem;
    return 301 https://${o.domain}$request_uri;
}
`;
}

export function generateCloudflareTransformRules(opts: ServerConfigOpts): string {
  const o = { ...DEFAULTS, ...opts };
  const csp = o.csp || buildCspString(RECOMMENDED_CSP);
  const hsts =
    `max-age=${o.hstsMaxAge}` +
    (o.includeSubdomains ? "; includeSubDomains" : "") +
    (o.preload ? "; preload" : "");

  return `# ---------------------------------------------------------------
# Cloudflare — Modify Response Header rules for ${o.domain}
# Dashboard:  Rules > Transform Rules > Modify Response Header
# Apply to:  (hostname matches "${o.domain}" OR hostname matches "www.${o.domain}")
# ---------------------------------------------------------------

# 1) Strict-Transport-Security
Set static
Header: Strict-Transport-Security
Value:  ${hsts}

# 2) Content-Security-Policy
Set static
Header: Content-Security-Policy
Value:  ${csp}

# 3) X-Content-Type-Options
Set static
Header: X-Content-Type-Options
Value:  nosniff

# 4) X-Frame-Options
Set static
Header: X-Frame-Options
Value:  SAMEORIGIN

# 5) Referrer-Policy
Set static
Header: Referrer-Policy
Value:  strict-origin-when-cross-origin

# 6) Permissions-Policy
Set static
Header: Permissions-Policy
Value:  camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()

# 7) Cross-Origin-Opener-Policy
Set static
Header: Cross-Origin-Opener-Policy
Value:  same-origin

# ---------------------------------------------------------------
# SSL/TLS settings  (Dashboard > SSL/TLS)
#   - Mode:               Full (Strict)
#   - Minimum TLS:        1.2
#   - Always Use HTTPS:   On
#   - Automatic HTTPS Rewrites: On
#   - HSTS preload:       Enabled (matches header above)
#
# Speed > Optimization
#   - Brotli:        On
#   - Early Hints:   On
#   - Auto Minify:   JS/CSS/HTML
#
# Bots & WAF
#   - Bot Fight Mode:                On
#   - Managed Rules > OWASP Core:    On (paranoia level 1)
#   - Rate-limit /auth/signin:       10 req / 1 min per IP
# ---------------------------------------------------------------
`;
}

export function generateApacheHtaccess(opts: ServerConfigOpts): string {
  const o = { ...DEFAULTS, ...opts };
  const csp = o.csp || buildCspString(RECOMMENDED_CSP);
  const hsts =
    `max-age=${o.hstsMaxAge}` +
    (o.includeSubdomains ? "; includeSubDomains" : "") +
    (o.preload ? "; preload" : "");

  return `# Apache .htaccess for ${o.domain}
RewriteEngine On

# Force HTTPS + non-www
RewriteCond %{HTTPS} !=on [OR]
RewriteCond %{HTTP_HOST} ^www\\. [NC]
RewriteRule ^ https://${o.domain}%{REQUEST_URI} [L,R=301]

# SPA fallback
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [QSA,L]

<IfModule mod_headers.c>
  Header always set Strict-Transport-Security "${hsts}"
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()"
  Header always set Cross-Origin-Opener-Policy "same-origin"
  Header always set Content-Security-Policy "${csp}"
</IfModule>
`;
}
