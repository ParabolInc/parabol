import {teamPrivacyChanges} from '../../../metricsHandler'
import getKysely from '../../../postgres/getKysely'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const toggleTeamPrivacy: MutationResolvers['toggleTeamPrivacy'] = async (
  _source,
  {teamId},
  {dataLoader}
) => {
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
  teamPrivacyChanges.inc({visibility: team.isPublic ? 'public' : 'private'})
  return data
}

export default toggleTeamPrivacy
