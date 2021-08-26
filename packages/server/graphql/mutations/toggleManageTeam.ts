import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import ToggleManageTeamPayload from '../types/ToggleManageTeamPayload'
import {GQLContext} from '../graphql'
import standardError from '../../utils/standardError'

const toggleManageTeam = {
  type: GraphQLNonNull(ToggleManageTeamPayload),
  description: `Show/hide the manage team sidebar`,
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the team to hide the manage team sidebar for'
    }
  },
  resolve: async (_source, {teamId}: {teamId: string}, {authToken}: GQLContext) => {
    const r = await getRethink()
    const viewerId = getUserId(authToken)

    //AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    const userId = getUserId(authToken)
    const viewerTeamMemberId = `${userId}::${teamId}`
    const res = await r
      .table('TeamMember')
      .get(viewerTeamMemberId)
      .update(
        (teamMember) => ({
          hideManageTeam: teamMember('hideManageTeam')
            .default(false)
            .not(),
          hideAgenda: true
        }),
        {returnChanges: true}
      )('changes')(0)('new_val')
      .run()

    const {hideManageTeam} = res
    return {hideManageTeam}
  }
}

export default toggleManageTeam
