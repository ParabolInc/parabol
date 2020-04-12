import {Security} from 'parabol-client/src/types/constEnums'

const getIsMassInviteToken = (invitationToken: string) =>
  invitationToken.length === Security.MASS_INVITATION_TOKEN_LENGTH
export default getIsMassInviteToken
