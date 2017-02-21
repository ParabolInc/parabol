import {INVITE_TOKEN_INVITE_ID_LEN} from 'server/utils/serverConstants';

export default function parseInviteToken(uriTokenString) {
  return {
    id: uriTokenString.slice(0, INVITE_TOKEN_INVITE_ID_LEN),
    key: uriTokenString.slice(INVITE_TOKEN_INVITE_ID_LEN)
  };
}
