import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import ToggleTeamDrawerPayload from '../types/ToggleTeamDrawerPayload'
import {GQLContext} from '../graphql'
import standardError from '../../utils/standardError'
import TeamDrawerEnum from '../types/TeamDrawerEnum'
import {DrawerTypes} from 'parabol-client/types/constEnums'

const toggleTeamDrawer = {
  type: GraphQLNonNull(ToggleTeamDrawerPayload),
  description: `Show/hide the drawer in the team dashboard`,
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the team to show/hide the drawer for'
    },
    teamDrawerType: {
      type: new GraphQLNonNull(TeamDrawerEnum),
      description: 'The type of team drawer that the viewer is toggling'
    }
  },
  resolve: async (
    _source,
    {teamId, teamDrawerType}: {teamId: string; teamDrawerType: DrawerTypes},
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
    return r
      .table('TeamMember')
      .get(viewerTeamMemberId)
      .update(
        (teamMember) => ({
          hideManageTeam: r.branch(
            teamDrawerType === DrawerTypes.MANAGE_TEAM,
            teamMember('hideManageTeam')
              .default(false)
              .not(),
            true
          ),
          hideAgenda: r.branch(
            teamDrawerType === DrawerTypes.AGENDA,
            teamMember('hideAgenda')
              .default(false)
              .not(),
            true
          )
        }),
        {returnChanges: true}
      )('changes')(0)('new_val')
      .run()
  }
}

export default toggleTeamDrawer
