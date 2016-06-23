import crypto from 'crypto';
/**
 * A secret token has the user id, an expiration, and a secret
 * the expiration allows for invalidating on the client or server. No need to hit the DB with an expired token
 * the user id allows for a quick db lookup in case you don't want to index on email (also eliminates pii)
 * the secret keeps out attackers (proxy for rate limiting, IP blocking, still encouraged)
 * storing it in the DB means there exists only 1, one-time use key, unlike a JWT, which has many, multi-use keys
 */
export default function makeSecretToken(id, epocExpiration) {
  return new Buffer(JSON.stringify({
    id,
    sec: crypto.randomBytes(8).toString('base64'),
    exp: epocExpiration
  })).toString('base64');
};
