import TeamMemberId from '../../../../client/shared/gqlIds/TeamMemberId'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import type {MutationResolvers} from '../resolverTypes'

const updateTeamSortOrder: MutationResolvers['updateTeamSortOrder'] = async (
  _source,
  {teamId, sortOrder},
  {authToken}
) => {
  const pg = getKysely()
  const teamMemberId = TeamMemberId.join(teamId, getUserId(authToken))
  await pg.updateTable('TeamMember').set({sortOrder}).where('id', '=', teamMemberId).execute()
  return {teamId}
}

export default updateTeamSortOrder
