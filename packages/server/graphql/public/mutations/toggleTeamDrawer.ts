import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const toggleTeamDrawer: MutationResolvers['toggleTeamDrawer'] = async (
  _source,
  {teamId, teamDrawerType},
  {authToken}
) => {
  const pg = getKysely()
  const viewerId = getUserId(authToken)

  // AUTH
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  // RESOLUTION
  const userId = getUserId(authToken)
  const viewerTeamMemberId = `${userId}::${teamId}`

  await pg
    .updateTable('TeamMember')
    .set(({fn, ref, val}) => ({
      openDrawer: fn('NULLIF', [val(teamDrawerType), ref('openDrawer')])
    }))
    .where('id', '=', viewerTeamMemberId)
    .execute()
  return {teamMemberId: viewerTeamMemberId}
}

export default toggleTeamDrawer
