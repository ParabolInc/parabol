import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import KillMeetingPayload from 'server/graphql/types/KillMeetingPayload'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import {LOBBY, TEAM} from 'universal/utils/constants'
import standardError from 'server/utils/standardError'

export default {
  type: KillMeetingPayload,
  description: 'Finish a meeting abruptly',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team that will be having the meeting'
    }
  },
  async resolve (source, {teamId}, {authToken, socketId: mutatorId, dataLoader}) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    // reset the meeting
    await r
      .table('Team')
      .get(teamId)
      .update({
        facilitatorPhase: LOBBY,
        meetingPhase: LOBBY,
        meetingId: null,
        facilitatorPhaseItem: null,
        meetingPhaseItem: null,
        activeFacilitator: null
      })

    const data = {teamId}
    publish(TEAM, teamId, KillMeetingPayload, data, subOptions)
    return data
  }
}
