import {GraphQLFloat, GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import DragDiscussionTopicPayload from 'server/graphql/types/DragDiscussionTopicPayload'
import {sendAlreadyEndedMeetingError} from 'server/utils/alreadyMutatedErrors'
import {isTeamMember} from 'server/utils/authorization'
import {sendTeamAccessError} from 'server/utils/authorizationErrors'
import {sendMeetingNotFoundError, sendStageNotFoundError} from 'server/utils/docNotFoundErrors'
import publish from 'server/utils/publish'
import {DISCUSS, TEAM} from 'universal/utils/constants'

export default {
  description: 'Changes the priority of the discussion topics',
  type: DragDiscussionTopicPayload,
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    stageId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat)
    }
  },
  async resolve (
    source,
    {meetingId, stageId, sortOrder},
    {authToken, dataLoader, socketId: mutatorId}
  ) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}

    // AUTH
    const meeting = await r.table('NewMeeting').get(meetingId)
    if (!meeting) return sendMeetingNotFoundError(authToken, meetingId)
    const {endedAt, phases, teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return sendTeamAccessError(authToken, teamId)
    }
    if (endedAt) return sendAlreadyEndedMeetingError(authToken, meetingId)
    const discussPhase = phases.find((phase) => phase.phaseType === DISCUSS)
    if (!discussPhase) {
      return sendStageNotFoundError(authToken, stageId)
    }
    const {stages} = discussPhase
    const draggedStage = stages.find((stage) => stage.id === stageId)
    if (!draggedStage) {
      return sendStageNotFoundError(authToken, stageId)
    }

    // RESOLUTION
    // MUTATIVE
    draggedStage.sortOrder = sortOrder
    stages.sort((a, b) => {
      return a.sortOrder > b.sortOrder ? 1 : -1
    })
    await r
      .table('NewMeeting')
      .get(meetingId)
      .update({
        phases
      })

    const data = {
      meetingId,
      stageId
    }
    publish(TEAM, teamId, DragDiscussionTopicPayload, data, subOptions)
    return data
  }
}
