import getKysely from '../../../postgres/getKysely'
import {getUserId, isSuperUser, isUserBillingLeader} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import isValid from '../../isValid'
import type {MutationResolvers} from '../resolverTypes'

const updateAutoJoin: MutationResolvers['updateAutoJoin'] = async (
  _source,
  {teamIds, autoJoin},
  context
) => {
  const {authToken, dataLoader} = context
  const viewerId = getUserId(authToken)
  if (!isSuperUser(authToken)) {
    const viewerTeams = (await dataLoader.get('teams').loadMany(teamIds)).filter(isValid)
    const billingLeaders = await Promise.all(
      viewerTeams.map(({orgId}) => isUserBillingLeader(viewerId, orgId, dataLoader))
    )
    if (!billingLeaders.every(Boolean)) {
      return standardError(new Error('Viewer is not billing leader'), {
        userId: viewerId
      })
    }
  }
  if (context.resourceGrants) {
    const hasAccess = await Promise.all(teamIds.map((id) => context.resourceGrants!.hasTeam(id)))
    if (hasAccess.some((v) => !v)) {
      return standardError(new Error('PAT does not grant access to this team'), {userId: viewerId})
    }
  }

  const updatedTeams = await getKysely()
    .updateTable('Team')
    .set({autoJoin})
    .where('id', 'in', teamIds)
    .returning('id')
    .execute()
  const updatedTeamIds = updatedTeams.map(({id}) => id)

  const data = {updatedTeamIds}
  return data
}

export default updateAutoJoin
