import {InvitationTokenError} from 'parabol-client/types/constEnums'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {isUserOrgAdmin} from '../../../utils/authorization'
import {verifyMassInviteToken} from '../../../utils/massInviteToken'
import type {QueryResolvers} from '../resolverTypes'

const massInvitationResolver: QueryResolvers['massInvitation'] = async (
  _source,
  {token},
  {dataLoader}
) => {
  const tokenRes = await verifyMassInviteToken(token, dataLoader)
  if ('error' in tokenRes && tokenRes.error === InvitationTokenError.NOT_FOUND) {
    return {errorType: InvitationTokenError.NOT_FOUND}
  }
  const {error, teamId, userId} = tokenRes as any
  const teamMemberId = toTeamMemberId(teamId, userId)
  const [user, teamMember, team] = await Promise.all([
    dataLoader.get('users').load(userId),
    dataLoader.get('teamMembers').load(teamMemberId),
    dataLoader.get('teams').load(teamId)
  ])

  if (!user || !team || team.isArchived) {
    return {errorType: InvitationTokenError.NOT_FOUND}
  }

  if (!teamMember || !teamMember.isNotRemoved) {
    const isOrgAdmin = await isUserOrgAdmin(userId, team.orgId, dataLoader)
    if (!isOrgAdmin) {
      // this could happen if a team member is no longer on the team or some unseen nefarious action is going on
      return {errorType: InvitationTokenError.NOT_FOUND}
    }
  }

  return {
    errorType: error,
    inviterName: user.preferredName,
    teamId,
    teamName: team.name
  }
}

export default massInvitationResolver
