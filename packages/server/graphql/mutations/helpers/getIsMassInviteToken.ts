import {Security} from 'parabol-client/types/constEnums'

const getIsMassInviteToken = (invitationToken: string) =>
  invitationToken.length === Security.MASS_INVITATION_TOKEN_LENGTH
export default getIsMassInviteToken
