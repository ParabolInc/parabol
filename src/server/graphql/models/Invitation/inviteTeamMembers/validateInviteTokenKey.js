import bcrypt from 'bcrypt';
import promisify from 'es6-promisify';

const compare = promisify(bcrypt.compare);

export default function validateInviteTokenKey(key, hashStringToCompare) {
  return compare(key, hashStringToCompare);
}
