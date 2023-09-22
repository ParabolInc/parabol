import updateTeamByTeamId from '../../../postgres/queries/updateTeamByTeamId'
import {getUserId, isSuperUser, isTeamMember} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const updateAutoJoin: MutationResolvers['updateAutoJoin'] = async (
  _source,
  {teamIds, autoJoin},
  {authToken}
) => {
  const viewerId = getUserId(authToken)
  if (!isSuperUser(authToken)) {
    const isNotMember = teamIds.some((teamId) => !isTeamMember(authToken, teamId))
    if (isNotMember) {
      return standardError(new Error('Not on team(s)'), {userId: viewerId})
    }
  }

  const updatedTeams = await updateTeamByTeamId({autoJoin}, teamIds)
  const updatedTeamIds = updatedTeams.map(({id}) => id)

  const data = {updatedTeamIds}
  return data
}

export default updateAutoJoin
