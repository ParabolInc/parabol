import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
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
    throw new GraphQLError('Cannot make a public team private on the starter tier', {
      extensions: {code: 'FORBIDDEN'}
    })
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
  return data
}

export default toggleTeamPrivacy
