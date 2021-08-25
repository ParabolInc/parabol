import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import TeamMember from '../types/TeamMember'
import {getUserId, isTeamMember} from '../../utils/authorization'

export default {
  type: TeamMember,
  description: 'Show/hide the agenda list',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the team to hide the agenda for'
    }
  },
  async resolve(_source, {teamId}, {authToken}) {
    const r = await getRethink()

    // AUTH
    // TODO return proper payload
    if (!isTeamMember(authToken, teamId)) return null

    // RESOLUTION
    const userId = getUserId(authToken)
    const myTeamMemberId = `${userId}::${teamId}`
    return r
      .table('TeamMember')
      .get(myTeamMemberId)
      .update(
        (teamMember) => ({
          hideAgenda: teamMember('hideAgenda')
            .default(false)
            .not(),
          hideManageTeam: true
        }),
        {returnChanges: true}
      )('changes')(0)('new_val')
      .run()
  }
}
