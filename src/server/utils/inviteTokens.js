import {createHmac} from 'crypto';
import shortid from 'shortid';

export const INVITE_TOKEN_SECRET_SALT =
  process.env.INVITE_TOKEN_SECRET_SALT || '87ebe991bdb514149f5a79127646248039b67ce1';

export function makeToken() {
  return shortid();
}

export function hashToken(tokenString) {
  const hmac = createHmac('sha256', INVITE_TOKEN_SECRET_SALT);
  hmac.update(tokenString);
  return hmac.digest('hex');
}

export function validateTokenType(tokenString) {
  return shortid.isValid(tokenString);
}

export function validateTokenHash(tokenString, hashString) {
  return hashToken(tokenString) === hashString;
}
