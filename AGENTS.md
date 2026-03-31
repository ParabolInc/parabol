# Parabol Conventions

## Security: Network Requests

- **Use `fetchUntrusted`/`postUntrusted` for external URLs.** Never use bare `fetch()` for requests to untrusted/external URLs (webhooks, SAML metadata, user-provided URLs). Use `fetchUntrusted`/`postUntrusted` from `packages/server/utils/fetchUntrusted.ts` — they perform DNS validation against SSRF (blocking private/internal IPs), pin DNS results, enforce timeouts, limit response sizes, and set a consistent User-Agent.

```ts
// Good
import {postUntrusted} from '../../../utils/fetchUntrusted'
const res = await postUntrusted(webhookUrl, {
  headers: {'Content-Type': 'application/json'},
  body: payload,
  signal: AbortSignal.timeout(MAX_REQUEST_TIME)
})

// Bad — no SSRF protection
import {fetch} from '@whatwg-node/fetch'
const res = await fetch(webhookUrl, {method: 'POST', body: payload})
```

- **Validate URLs via `new URL()` parsing, not string methods.** String checks like `startsWith('https://api.example.com')` are vulnerable to attacks (e.g. `api.example.com@evil.org`). Always parse with `new URL()` and check `.protocol` and `.hostname`.

```ts
// Good
const parsed = new URL(fetchUrl)
if (parsed.protocol !== 'https:' || parsed.hostname !== 'api.atlassian.com') return null

// Bad
if (!fetchUrl.startsWith('https://api.atlassian.com')) return null
```

## Security: JWT & Session Management

- **Blacklist JWT sessions on security-sensitive operations.** When a user signs out, resets their password, refreshes their session, or is deleted, blacklist the JWT. Use `blacklistJWTSession(jti, exp)` for single-session invalidation (sign-out) or `blacklistJWT(userId, timestamp, socketId)` for all-session invalidation (password reset). Each `AuthToken` must have a `jti` (via `randomUUID()`).

```ts
// Sign out — blacklist single session
if (authToken?.jti && authToken?.exp) {
  await blacklistJWTSession(authToken.jti, authToken.exp)
}

// Password reset — blacklist all sessions (sleep avoids races)
await blacklistJWT(userId, toEpochSeconds(new Date()) + 2, context.socketId)
await sleep(2000)
```

- **Verify tokens match the requesting user's identity.** Team invite tokens must match the recipient's email. Reset tokens are looked up by hash (not plaintext). Accepted tokens cannot be reused.

## Security: Token Hashing

- **Hash high-entropy tokens with SHA-256, not bcrypt.** Cryptographically random tokens (e.g. 48-byte reset tokens with 384-bit entropy) are immune to brute-force regardless of hash speed. Use SHA-256 for these. Reserve bcrypt/argon2 for low-entropy user passwords. Store the hash in a `tokenHash` column.

```ts
const sha256Hex = (value: string) => crypto.createHash('sha256').update(value).digest('hex')
const tokenHash = sha256Hex(resetPasswordToken)
```

## Security: Shell Commands

- **Use `execFile` with argument arrays, not `exec` with string interpolation.** `execFile` avoids shell injection by passing arguments directly without shell interpretation.

```ts
// Good
const execFile = util.promisify(childProcess.execFile)
await execFile('pg_dump', [dbName, '--format=c', '--schema-only', `--file=${path}`])

// Bad — shell injection risk
const exec = util.promisify(childProcess.exec)
await exec(`pg_dump ${dbName} --format=c --schema-only --file ${path}`)
```

## Testing

- **Security tests must document the attack vector and include CVE references.** Write tests as regression tests that explain the threat model, craft realistic attack payloads, and verify the defense works.

```ts
/**
 * Security regression tests for the JWT "alg=none" attack.
 * CVE reference: CVE-2015-9235
 */
test('rejects alg=none token crafted with jsonwebtoken sign()', () => {
  const maliciousJwt = craftAlgNoneToken(VICTIM_USER_ID)
  const result = getVerifiedAuthToken(maliciousJwt, false)
  expect(result.sub).toBeUndefined()
})
```

- **Integration tests use `sendPublic()` with `toMatchObject`.** Use the `sendPublic()` helper from `packages/server/__tests__/common.ts` to send GraphQL queries/mutations. Assert with `toMatchObject` and `expect.anything()` for dynamic values — avoid brittle exact-match assertions.

```ts
const result = await sendPublic({
  query: `mutation ResetPassword($token: ID!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword) {
      error { message }
      userId
    }
  }`,
  variables: {token, newPassword},
  cookie
})
expect(result).toMatchObject({
  data: {resetPassword: {error: null, userId: expect.anything()}}
})
```

## Module Exports

- **Use named exports for utility modules.** Prefer `export const foo = ...` over `export default foo`. Use named imports: `import {foo} from './utils/foo'`.
