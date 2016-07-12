import crypto from 'crypto';
/**
 * A secret token has the user id, an expiration, and a secret
 * the expiration allows for invalidating on the client or server. No need to hit the DB with an expired token
 * the user id allows for a quick db lookup in case you don't want to index on email (also eliminates pii)
 * the secret keeps out attackers (proxy for rate limiting, IP blocking, still encouraged)
 * storing it in the DB means there exists only 1, one-time use key, unlike a JWT, which has many, multi-use keys
 */
export function makeInviteToken(id, epocExpiration) {
  return new Buffer(JSON.stringify({
    id,
    sec: crypto.randomBytes(8).toString('base64'),
    exp: epocExpiration
  })).toString('base64');
}

export function parseInviteToken(tokenString) {
  // eslint-disable-next-line new-cap
  return JSON.parse(new Buffer.from(tokenString, 'base64'));
}

export function validateInviteToken(tokenString) {
  const result = { token: null, valid: false, error: '' };
  let t = null;
  try {
    t = parseInviteToken(tokenString);
  } catch (e) {
    result.error = 'unable to parse token string';
    return result;
  }
  // validate shape:
  if (!t.hasOwnProperty('exp') || typeof t.exp !== 'number' ||
      !t.hasOwnProperty('id') || typeof t.id !== 'string' ||
      !t.hasOwnProperty('sec') || typeof t.sec !== 'string') {
    result.error = 'invalid token shape';
    return result;
  }
  // TODO: check secret validity
  // check expiration
  if (Date.now() > t.exp) {
    result.error = 'invitation token expired';
    return result;
  }
  result.token = t;
  result.valid = true;
  return result;
}
