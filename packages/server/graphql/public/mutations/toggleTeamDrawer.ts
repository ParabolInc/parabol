import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import type {MutationResolvers} from '../resolverTypes'

const toggleTeamDrawer: MutationResolvers['toggleTeamDrawer'] = async (
  _source,
  {teamId, teamDrawerType},
  {authToken}
) => {
  const pg = getKysely()
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
