import updateTeamByTeamId from '../../../postgres/queries/updateTeamByTeamId'
import {getUserId, isSuperUser, isUserBillingLeader} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import isValid from '../../isValid'
import {MutationResolvers} from '../resolverTypes'

const updateAutoJoin: MutationResolvers['updateAutoJoin'] = async (
  _source,
  {teamIds, autoJoin},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  if (!isSuperUser(authToken)) {
    const viewerTeams = (await dataLoader.get('teams').loadMany(teamIds)).filter(isValid)
    const isNotBillingLeader = viewerTeams.some(
      ({orgId}) => !isUserBillingLeader(viewerId, orgId, dataLoader)
    )
    if (isNotBillingLeader) {
      return standardError(new Error('Viewer is not billing leader'), {userId: viewerId})
    }
  }

  const updatedTeams = await updateTeamByTeamId({autoJoin}, teamIds)
  const updatedTeamIds = updatedTeams.map(({id}) => id)

  const data = {updatedTeamIds}
  return data
}

export default updateAutoJoin
