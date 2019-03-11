import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import PromoteFacilitatorPayload from 'server/graphql/types/PromoteFacilitatorPayload'
import publish from 'server/utils/publish'
import {TEAM} from 'universal/utils/constants'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId'
import standardError from 'server/utils/standardError'

export default {
  type: PromoteFacilitatorPayload,
  description: 'Change a facilitator while the meeting is in progress',
  args: {
    disconnectedFacilitatorId: {
      type: GraphQLID,
      description: 'teamMemberId of the old facilitator, if they disconnected'
    },
    facilitatorId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'teamMemberId of the new facilitator for this meeting'
    }
  },
  resolve: async function (
    source,
    {disconnectedFacilitatorId, facilitatorId},
    {authToken, dataLoader, socketId: mutatorId}
  ) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    const {teamId} = fromTeamMemberId(facilitatorId)
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const facilitatorMembership = await dataLoader.get('teamMembers').load(facilitatorId)
    if (!facilitatorMembership || !facilitatorMembership.isNotRemoved) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    await r
      .table('Team')
      .get(teamId)
      .update({
        activeFacilitator: facilitatorId
      })

    const data = {
      teamId,
      disconnectedFacilitatorId,
      newFacilitatorId: facilitatorId
    }
    publish(TEAM, teamId, PromoteFacilitatorPayload, data, subOptions)
    return data
  }
}
