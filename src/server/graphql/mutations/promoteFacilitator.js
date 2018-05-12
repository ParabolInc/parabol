import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import PromoteFacilitatorPayload from 'server/graphql/types/PromoteFacilitatorPayload'
import publish from 'server/utils/publish'
import {TEAM} from 'universal/utils/constants'
import {isTeamMember} from 'server/utils/authorization'
import {sendTeamAccessError, sendTeamMemberNotOnTeamError} from 'server/utils/authorizationErrors'
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId'

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
  async resolve (
    source,
    {disconnectedFacilitatorId, facilitatorId},
    {authToken, dataLoader, socketId: mutatorId}
  ) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const {userId, teamId} = fromTeamMemberId(facilitatorId)
    if (!isTeamMember(authToken, teamId)) {
      return sendTeamAccessError(authToken, teamId)
    }

    // VALIDATION
    const facilitatorMembership = await dataLoader.get('teamMembers').load(facilitatorId)
    if (!facilitatorMembership || !facilitatorMembership.isNotRemoved) {
      return sendTeamMemberNotOnTeamError(authToken, {teamId, userId})
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
