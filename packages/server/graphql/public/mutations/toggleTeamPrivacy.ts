import getKysely from '../../../postgres/getKysely'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const toggleTeamPrivacy: MutationResolvers['toggleTeamPrivacy'] = async (
  _source,
  {teamId},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const viewer = await dataLoader.get('users').loadNonNull(viewerId)
  const pg = getKysely()

  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const org = await dataLoader.get('organizations').loadNonNull(team.orgId)

  if (team.isPublic && org.tier === 'starter') {
    return standardError(new Error('Cannot make a public team private on the starter tier'))
  }

  await pg
    .updateTable('Team')
    .set({
      isPublic: !team.isPublic
    })
    .where('id', '=', teamId)
    .execute()

  team.isPublic = !team.isPublic

  const data = {teamId}
  analytics.teamPrivacyChanged(viewer, teamId, team.isPublic)
  return data
}

export default toggleTeamPrivacy
