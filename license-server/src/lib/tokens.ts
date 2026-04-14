// Crockford base32 alphabet, no ambiguous characters (no 0, O, 1, I, L, U).
const ALPHABET = 'ABCDEFGHJKMNPQRSTVWXYZ23456789';

/**
 * Generate a human-friendly seat token: PSG-XXXX-XXXX-XXXX (12 random chars).
 * Entropy: 12 * log2(30) ≈ 58.9 bits. Plenty for per-install keys behind a DB lookup.
 */
export function generateSeatToken(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const chars: string[] = [];
  for (const b of bytes) chars.push(ALPHABET[b % ALPHABET.length]);
  return `PSG-${chars.slice(0, 4).join('')}-${chars.slice(4, 8).join('')}-${chars.slice(8, 12).join('')}`;
}
