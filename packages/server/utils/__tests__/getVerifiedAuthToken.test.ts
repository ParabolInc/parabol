import {sign} from 'jsonwebtoken'
import AuthToken from '../../database/types/AuthToken'
import encodeAuthToken, {encodeUnsignedAuthToken} from '../encodeAuthToken'
import getVerifiedAuthToken from '../getVerifiedAuthToken'

/**
 * Security regression tests for the JWT "alg=none" attack.
 *
 * An attacker who knows a valid userId can craft a JWT with alg=none (no
 * signature) and claim to be that user. The server must reject such tokens
 * even though the payload looks legitimate.
 *
 * CVE reference: JWT alg=none vulnerability (CVE-2015-9235 / jwt.io "none"
 * algorithm confusion attack).
 */

const VICTIM_USER_ID = 'user:victimUser000'

/** Build a well-formed alg=none JWT using jsonwebtoken's own sign helper. */
function craftAlgNoneToken(sub: string): string {
  const payload = {
    sub,
    tms: [] as string[],
    aud: 'action',
    iss: 'http://localhost/',
    rol: null,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  }
  return sign(payload, '', {algorithm: 'none'})
}

/** Build a raw base64url-encoded JWT without using any JWT library. */
function craftRawAlgNoneToken(sub: string): string {
  const b64url = (obj: object) => Buffer.from(JSON.stringify(obj)).toString('base64url')

  const header = b64url({alg: 'none', typ: 'JWT'})
  const body = b64url({
    sub,
    tms: [],
    aud: 'action',
    rol: null,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  })

  // alg=none tokens have an empty signature segment
  return `${header}.${body}.`
}

test('rejects alg=none token crafted with jsonwebtoken sign()', () => {
  const maliciousJwt = craftAlgNoneToken(VICTIM_USER_ID)

  // Sanity-check: the token itself contains the victim's userId
  const [, rawPayload] = maliciousJwt.split('.')
  const decoded = JSON.parse(Buffer.from(rawPayload!, 'base64url').toString())
  expect(decoded.sub).toBe(VICTIM_USER_ID)

  // The server must reject the token and return null
  const result = getVerifiedAuthToken(maliciousJwt, false)
  expect(result).toBeNull()
})

test('rejects manually constructed base64url alg=none token', () => {
  const maliciousJwt = craftRawAlgNoneToken(VICTIM_USER_ID)

  const result = getVerifiedAuthToken(maliciousJwt, false)
  expect(result).toBeNull()
})

test('rejects the encodeUnsignedAuthToken output when used as a server token', () => {
  // encodeUnsignedAuthToken is the utility used to create the *client-readable*
  // cookie (authToken) so the browser can inspect auth state without a secret.
  // An attacker could copy that cookie and present it as the *signed* token.
  const authToken = new AuthToken({sub: VICTIM_USER_ID, tms: []})
  const unsignedJwt = encodeUnsignedAuthToken(authToken)

  const result = getVerifiedAuthToken(unsignedJwt, false)
  expect(result).toBeNull()
})

test('accepts a legitimately signed token for the same userId', () => {
  // Baseline: a properly signed HS256 token for the same user IS accepted,
  // confirming the reject-path above is not a false positive.
  const authToken = new AuthToken({sub: VICTIM_USER_ID, tms: []})
  const validJwt = encodeAuthToken(authToken)

  const result = getVerifiedAuthToken(validJwt, false)
  expect(result?.sub).toBe(VICTIM_USER_ID)
})
