import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import ToggleManageTeamPayload from '../types/ToggleManageTeamPayload'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
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
  resolve: async (
    _source,
    {teamId}: {teamId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    //AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    const userId = getUserId(authToken)
    const myTeamMemberId = `${userId}::${teamId}`
    const res = await r
      .table('TeamMember')
      .get(myTeamMemberId)
      .update(
        (teamMember) => ({
          hideManageTeam: teamMember('hideManageTeam')
            .default(false)
            .not()
        }),
        {returnChanges: true}
      )('changes')(0)('new_val')
      .run()

    const {hideManageTeam} = res
    return hideManageTeam
  }
}

export default toggleManageTeam
