import {getUserId, isSuperUser, isTeamMember} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import inviteToTeamHelper from '../../mutations/helpers/inviteToTeamHelper'
import type {MutationResolvers} from '../resolverTypes'

const inviteToTeam: MutationResolvers['inviteToTeam'] = async (
  _source,
  {invitees: inviteesInput, meetingId, teamId},
  context
) => {
  const {authToken} = context

  // AUTH
  const viewerId = getUserId(authToken)
  if (!isTeamMember(authToken, teamId) && !isSuperUser(authToken)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }
  return await inviteToTeamHelper(inviteesInput, teamId, meetingId, context)
}

export default inviteToTeam
