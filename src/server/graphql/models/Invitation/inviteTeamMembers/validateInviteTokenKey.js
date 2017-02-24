import bcrypt from 'bcrypt';
import promisify from 'es6-promisify';

const compare = promisify(bcrypt.compare);

export default async function validateInviteTokenKey(key, hashStringToCompare) {
  return await compare(key, hashStringToCompare);
}
