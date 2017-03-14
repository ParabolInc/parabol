import bcrypt from 'bcrypt';
import promisify from 'es6-promisify';
import parseInviteToken from 'server/graphql/models/Invitation/inviteTeamMembers/parseInviteToken';

const hash = promisify(bcrypt.hash);
const INVITE_TOKEN_KEY_HASH_ROUNDS = parseInt(process.env.INVITE_TOKEN_KEY_HASH_ROUNDS, 10) || 10;

export default function hashInviteTokenKey(uriTokenString) {
  const {key} = parseInviteToken(uriTokenString);
  return hash(key, INVITE_TOKEN_KEY_HASH_ROUNDS);
}
