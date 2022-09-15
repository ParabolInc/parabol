import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {RValue} from '../../database/stricterR'
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
    const r = await getRethink()
    const viewerId = getUserId(authToken)

    //AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    const userId = getUserId(authToken)
    const viewerTeamMemberId = `${userId}::${teamId}`
    await r
      .table('TeamMember')
      .get(viewerTeamMemberId)
      .update((teamMember: RValue) => ({
        openDrawer: r.branch(
          teamMember('openDrawer').default(null).eq(teamDrawerType),
          null,
          teamDrawerType
        )
      }))
      .run()
    return {teamMemberId: viewerTeamMemberId}
  }
}

export default toggleTeamDrawer
