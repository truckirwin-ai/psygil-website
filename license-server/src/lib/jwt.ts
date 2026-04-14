import { SignJWT, jwtVerify, importPKCS8, importSPKI } from 'jose';
import type { Env, LicenseClaims } from '../types';

const ALG = 'EdDSA';

function b64ToPem(b64: string, kind: 'PRIVATE' | 'PUBLIC'): string {
  const clean = b64.replace(/\s+/g, '');
  const body = clean.match(/.{1,64}/g)!.join('\n');
  return `-----BEGIN ${kind} KEY-----\n${body}\n-----END ${kind} KEY-----\n`;
}

export async function signLicenseJwt(env: Env, claims: Omit<LicenseClaims, 'iat' | 'exp' | 'iss'>): Promise<string> {
  const key = await importPKCS8(b64ToPem(env.LICENSE_SIGNING_KEY_PRIVATE, 'PRIVATE'), ALG);
  const ttl = Number(env.JWT_TTL_SECONDS);
  return await new SignJWT(claims as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: ALG, typ: 'JWT' })
    .setIssuer(env.ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${ttl}s`)
    .sign(key);
}

export async function verifyLicenseJwt(env: Env, token: string): Promise<LicenseClaims> {
  const key = await importSPKI(b64ToPem(env.LICENSE_SIGNING_KEY_PUBLIC, 'PUBLIC'), ALG);
  const { payload } = await jwtVerify(token, key, { issuer: env.ISSUER });
  return payload as unknown as LicenseClaims;
}
