import {getUserId, isSuperUser, isTeamMemberAsync} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import inviteToTeamHelper from '../../mutations/helpers/inviteToTeamHelper'
import type {MutationResolvers} from '../resolverTypes'

const inviteToTeam: MutationResolvers['inviteToTeam'] = async (
  _source,
  {invitees: inviteesInput, meetingId, teamId},
  context
) => {
  const {authToken, dataLoader} = context

  // AUTH
  const viewerId = getUserId(authToken)
  if (!(await isTeamMemberAsync(viewerId, teamId, dataLoader)) && !isSuperUser(authToken)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }
  return await inviteToTeamHelper(inviteesInput, teamId, meetingId, context)
}

export default inviteToTeam
