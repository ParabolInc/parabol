import TeamMemberId from '../../../../client/shared/gqlIds/TeamMemberId'
import getKysely from '../../../postgres/getKysely'
import {MutationResolvers} from '../resolverTypes'

const updateTeamSortOrder: MutationResolvers['updateTeamSortOrder'] = async (
  _source,
  {teamId, sortOrder},
  {authToken}
) => {
  const pg = getKysely()
  const teamMemberId = TeamMemberId.join(teamId, authToken.sub)
  await pg.updateTable('TeamMember').set({sortOrder}).where('id', '=', teamMemberId).execute()
  return {teamId}
}

export default updateTeamSortOrder
