/**
 * Generate an Ed25519 keypair for signing license JWTs.
 *
 * Run: npm run keys:generate
 *
 * Outputs:
 *   - LICENSE_SIGNING_KEY_PRIVATE (base64, for `wrangler secret put`)
 *   - LICENSE_SIGNING_KEY_PUBLIC  (base64, for `wrangler secret put`)
 *   - PEM public key to embed in the desktop app for offline verification
 *
 * Rotate by generating a new pair, updating secrets, and shipping a new desktop build
 * that trusts both the old and new public keys for one JWT TTL window.
 */
import { generateKeyPair, exportPKCS8, exportSPKI } from 'jose';

const { privateKey, publicKey } = await generateKeyPair('EdDSA', {
  crv: 'Ed25519',
  extractable: true,
});

const privPem = await exportPKCS8(privateKey);
const pubPem = await exportSPKI(publicKey);

function pemToB64(pem: string): string {
  return pem
    .split('\n')
    .filter((line) => line && !line.startsWith('-----'))
    .join('');
}

const privB64 = pemToB64(privPem);
const pubB64 = pemToB64(pubPem);

console.log('# Paste these into wrangler secrets:');
console.log('#   echo -n <value> | wrangler secret put LICENSE_SIGNING_KEY_PRIVATE');
console.log('#   echo -n <value> | wrangler secret put LICENSE_SIGNING_KEY_PUBLIC');
console.log('');
console.log(`LICENSE_SIGNING_KEY_PRIVATE=${privB64}`);
console.log(`LICENSE_SIGNING_KEY_PUBLIC=${pubB64}`);
console.log('');
console.log('# Embed this public key in the desktop app (PEM):');
console.log(pubPem);
