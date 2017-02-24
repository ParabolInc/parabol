import {INVITE_TOKEN_KEY_LEN, INVITE_TOKEN_INVITE_ID_LEN} from 'server/utils/serverConstants';
import crypto from 'crypto';

const asciiAlphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_';

const randomSafeString = (length = 8, chars = asciiAlphabet) => {
  const randomBytes = crypto.randomBytes(length);
  const result = new Array(length);
  let cursor = 0;
  for (let i = 0; i < length; i++) {
    cursor += randomBytes[i];
    result[i] = chars[cursor % chars.length];
  }
  return result.join('');
};

export default function makeInviteToken() {
  return `${randomSafeString(INVITE_TOKEN_INVITE_ID_LEN)}${randomSafeString(INVITE_TOKEN_KEY_LEN)}`;
}
