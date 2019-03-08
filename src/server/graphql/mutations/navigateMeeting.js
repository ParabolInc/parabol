import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {getUserId} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import {TEAM} from 'universal/utils/constants'
import NavigateMeetingPayload from 'server/graphql/types/NavigateMeetingPayload'
import findStageById from 'universal/utils/meetings/findStageById'
import handleCompletedStage from 'server/graphql/mutations/helpers/handleCompletedStage'
import unlockNextStages from 'universal/utils/unlockNextStages'
import startStage_ from 'universal/utils/startStage_'
import standardError from 'server/utils/standardError'

export default {
  type: new GraphQLNonNull(NavigateMeetingPayload),
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
  async resolve(
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
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {facilitatorUserId, phases, teamId} = meeting
    if (viewerId !== facilitatorUserId) {
      return standardError(new Error('Not meeting facilitator'), {userId: viewerId})
    }

    // VALIDATION
    let phaseCompleteData
    let unlockedStageIds
    if (completedStageId) {
      const completedStageRes = findStageById(phases, completedStageId)
      if (!completedStageRes) {
        return standardError(new Error('Meeting stage not found'), {userId: viewerId})
      }
      const {stage} = completedStageRes
      if (!stage.isNavigableByFacilitator) {
        return standardError(new Error('Stage has not started'), {userId: viewerId})
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
        return standardError(new Error('Stage not found'), {userId: viewerId})
      }
      const {stage: facilitatorStage} = facilitatorStageRes
      if (!facilitatorStage.isNavigableByFacilitator) {
        return standardError(new Error('Stage has not started'), {userId: viewerId})
      }

      // mutative
      // NOTE: it is possible to start a stage then move backwards & complete another phase, which would make it seem like this phase took a long time
      // the cleanest way to fix this is to store start/stop on each stage visit, since i could visit B, then visit A, then move B before A, then visit B
      startStage_(facilitatorStage)

      // mutative! sets isNavigable and isNavigableByFacilitator
      unlockedStageIds = unlockNextStages(facilitatorStageId, phases, meetingId)
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
