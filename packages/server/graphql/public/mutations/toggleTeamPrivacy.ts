import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import getKysely from '../../../postgres/getKysely'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isUserOrgAdmin} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const toggleTeamPrivacy: MutationResolvers['toggleTeamPrivacy'] = async (
  _source,
  {teamId},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const viewer = await dataLoader.get('users').loadNonNull(viewerId)
  const pg = getKysely()

  const teamMemberId = toTeamMemberId(teamId, viewerId)
  const teamMember = await dataLoader.get('teamMembers').load(teamMemberId)
  if (!teamMember) {
    return standardError(new Error('Not a member of the team'))
  }

  const team = await dataLoader.get('teams').load(teamId)
  if (!team) {
    return standardError(new Error('Team not found'))
  }
  const isOrgAdmin = await isUserOrgAdmin(viewerId, team.orgId, dataLoader)
  if (!teamMember.isLead && !isOrgAdmin) {
    return standardError(new Error('Not team lead or org admin'))
  }

  if (team.isPublic && team.tier === 'starter') {
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
