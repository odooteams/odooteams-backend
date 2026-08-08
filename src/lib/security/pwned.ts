/**
 * Leaked-password guard (client-side).
 * Uses the Have I Been Pwned "range" API with k-anonymity:
 * only the first 5 chars of the SHA-1 hash ever leave the browser.
 */

export interface PwnedResult {
  /** true when the password appears in a known breach corpus */
  breached: boolean;
  /** number of times it was seen in breaches (0 when unknown/safe) */
  count: number;
  /** true when the online check could not be performed */
  offline: boolean;
  /** local heuristic failure reason, if any */
  weakReason?: string;
}

const COMMON_PASSWORDS = [
  'password', 'password1', 'password123', '123456', '12345678', '123456789',
  'qwerty', 'qwerty123', 'abc123', 'letmein', 'welcome', 'admin', 'admin123',
  'iloveyou', 'monkey', 'dragon', 'sunshine', 'football', 'princess',
  'passw0rd', 'p@ssw0rd', 'test1234', 'changeme', 'odooteams', 'odoo1234',
];

export function localWeaknessReason(password: string, context: string[] = []): string | undefined {
  const p = password.trim();
  if (p.length < 8) return 'Password must be at least 8 characters.';
  const lower = p.toLowerCase();
  if (COMMON_PASSWORDS.includes(lower)) return 'This password is one of the most commonly breached passwords.';
  if (/^(.)\1+$/.test(p)) return 'Password cannot be a single repeated character.';
  if (/^(0123456789|1234567890|abcdefgh|qwertyui)/i.test(p)) return 'Password cannot be a simple sequence.';
  if (!/[a-zA-Z]/.test(p) || !/[0-9]/.test(p)) return 'Use at least one letter and one number.';
  for (const c of context) {
    const token = (c || '').split('@')[0].toLowerCase();
    if (token.length >= 4 && lower.includes(token)) {
      return 'Password must not contain your name or email address.';
    }
  }
  return undefined;
}

async function sha1Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

/** Query HIBP range API. Returns breach count (0 = not found). Throws on network failure. */
export async function pwnedCount(password: string, signal?: AbortSignal): Promise<number> {
  const hash = await sha1Hex(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);
  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { 'Add-Padding': 'true' },
    signal,
  });
  if (!res.ok) throw new Error(`HIBP responded ${res.status}`);
  const body = await res.text();
  for (const line of body.split('\n')) {
    const [suf, count] = line.trim().split(':');
    if (suf === suffix) return parseInt(count || '0', 10) || 0;
  }
  return 0;
}

/**
 * Full guard: local heuristics + breach corpus lookup.
 * Never blocks signup because of a network problem (fails open, flagged via `offline`).
 */
export async function checkPasswordSafety(password: string, context: string[] = []): Promise<PwnedResult> {
  const weakReason = localWeaknessReason(password, context);
  if (weakReason) return { breached: true, count: 0, offline: false, weakReason };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const count = await pwnedCount(password, controller.signal);
    clearTimeout(timer);
    return { breached: count > 0, count, offline: false };
  } catch {
    return { breached: false, count: 0, offline: true };
  }
}

export function breachMessage(result: PwnedResult): string {
  if (result.weakReason) return result.weakReason;
  if (result.breached) {
    return `This password appeared in ${result.count.toLocaleString()} known data breaches. Please choose a different one.`;
  }
  return '';
}
