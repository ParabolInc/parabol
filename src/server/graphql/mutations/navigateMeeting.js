import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {getUserId} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import {TEAM} from 'universal/utils/constants'
import {sendNotMeetingFacilitatorError} from 'server/utils/authorizationErrors'
import NavigateMeetingPayload from 'server/graphql/types/NavigateMeetingPayload'
import {
  sendMeetingNotFoundError,
  sendStageNotFoundError,
  sendStageNotUnlockedError
} from 'server/utils/docNotFoundErrors'
import findStageById from 'universal/utils/meetings/findStageById'
import handleCompletedStage from 'server/graphql/mutations/helpers/handleCompletedStage'
import unlockNextStages from 'server/graphql/mutations/helpers/unlockNextStages'

export default {
  type: NavigateMeetingPayload,
  description: 'update a meeting by marking an item complete and setting the facilitator location',
  args: {
    completedStageId: {
      type: GraphQLID,
      description: 'The stage that the facilitator would like to mark as complete'
    },
    facilitatorStageId: {
      type: GraphQLID,
      description: 'The stage where the facilitator is'
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The meeting ID'
    }
  },
  async resolve (
    source,
    {completedStageId, facilitatorStageId, meetingId},
    {authToken, socketId: mutatorId, dataLoader}
  ) {
    const r = getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)
    const meeting = await r
      .table('NewMeeting')
      .get(meetingId)
      .default(null)
    if (!meeting) return sendMeetingNotFoundError(authToken, meetingId)
    const {facilitatorUserId, phases, teamId} = meeting
    if (viewerId !== facilitatorUserId) {
      return sendNotMeetingFacilitatorError(authToken, viewerId)
    }

    // VALIDATION
    let phaseCompleteData
    let unlockedStageIds
    if (completedStageId) {
      const completedStageRes = findStageById(phases, completedStageId)
      if (!completedStageRes) {
        return sendStageNotFoundError(authToken, completedStageId)
      }
      const {stage} = completedStageRes
      if (!stage.isNavigableByFacilitator) {
        return sendStageNotUnlockedError(authToken, completedStageId)
      }
      if (!stage.isComplete) {
        // MUTATIVE
        stage.isComplete = true
        stage.endAt = now
        // handle any side effects, this could mutate the meeting object!
        phaseCompleteData = await handleCompletedStage(stage, meeting, dataLoader)
      }
    }
    if (facilitatorStageId) {
      const facilitatorStageRes = findStageById(phases, facilitatorStageId)
      if (!facilitatorStageRes) {
        return sendStageNotFoundError(authToken, facilitatorStageId)
      }
      const {stage: facilitatorStage} = facilitatorStageRes
      if (!facilitatorStage.isNavigableByFacilitator) {
        return sendStageNotUnlockedError(authToken, facilitatorStageId)
      }

      // mutative
      facilitatorStage.startAt = facilitatorStage.startAt || now
      facilitatorStage.viewCount = facilitatorStage.viewCount ? facilitatorStage.viewCount + 1 : 1

      // mutative! sets isNavigable and isNavigableByFacilitator
      unlockedStageIds = await unlockNextStages(facilitatorStageId, phases, meetingId)
    }

    // RESOLUTION
    const oldFacilitatorStageId = await r
      .table('NewMeeting')
      .get(meetingId)
      .update(
        {
          facilitatorStageId,
          phases,
          updatedAt: now
        },
        {returnChanges: true}
      )('changes')(0)('old_val')('facilitatorStageId')

    const data = {
      meetingId,
      oldFacilitatorStageId,
      facilitatorStageId,
      unlockedStageIds,
      ...phaseCompleteData
    }
    publish(TEAM, teamId, NavigateMeetingPayload, data, subOptions)
    return data
  }
}
