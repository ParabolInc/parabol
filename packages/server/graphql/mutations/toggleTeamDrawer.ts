import {GraphQLID, GraphQLNonNull} from 'graphql'
import getKysely from '../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import TeamDrawerEnum, {TeamDrawer} from '../types/TeamDrawerEnum'
import ToggleTeamDrawerPayload from '../types/ToggleTeamDrawerPayload'

const toggleTeamDrawer = {
  type: new GraphQLNonNull(ToggleTeamDrawerPayload),
  description: `Show/hide the drawer in the team dashboard`,
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the team to show/hide the drawer for'
    },
    teamDrawerType: {
      type: TeamDrawerEnum,
      description:
        'The type of team drawer that the viewer is toggling. Null if closing the drawer.'
    }
  },
  resolve: async (
    _source: unknown,
    {teamId, teamDrawerType}: {teamId: string; teamDrawerType: TeamDrawer | null},
    {authToken}: GQLContext
  ) => {
    const pg = getKysely()
    const viewerId = getUserId(authToken)

    //AUTH
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
}

export default toggleTeamDrawer
