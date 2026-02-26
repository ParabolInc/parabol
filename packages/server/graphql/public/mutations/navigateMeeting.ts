import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import startStage_ from 'parabol-client/utils/startStage_'
import unlockNextStages from 'parabol-client/utils/unlockNextStages'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {Logger} from '../../../utils/Logger'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import handleCompletedStage from '../../mutations/helpers/handleCompletedStage'
import removeScheduledJobs from '../../mutations/helpers/removeScheduledJobs'
import type {MutationResolvers} from '../resolverTypes'

const navigateMeeting: MutationResolvers['navigateMeeting'] = async (
  _source,
  {completedStageId, facilitatorStageId, meetingId},
  {authToken, socketId: mutatorId, dataLoader}
) => {
  const now = new Date()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const viewerId = getUserId(authToken)
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
  const {createdBy, endedAt, facilitatorUserId, phases, teamId, meetingType} = meeting
  if (endedAt) return {error: {message: 'Meeting already ended'}}
  if (viewerId !== facilitatorUserId) {
    if (viewerId !== createdBy) {
      return standardError(new Error('Not meeting facilitator'), {userId: viewerId})
    }
    return standardError(new Error('Not meeting facilitator anymore'), {userId: viewerId})
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
      stage.isComplete = true
      stage.endAt = now
      if (meetingType !== 'poker') {
        stage.readyToAdvance = stage.readyToAdvance || []
        if (!stage.readyToAdvance.includes(facilitatorUserId)) {
          stage.readyToAdvance.push(facilitatorUserId)
        }
      }
      phaseCompleteData = await handleCompletedStage(stage, meeting, dataLoader)
      if (stage.scheduledEndTime) {
        removeScheduledJobs(stage.scheduledEndTime, {meetingId}).catch(Logger.error)
        stage.scheduledEndTime = null
      }
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
    if (meeting.facilitatorStageId === facilitatorStageId) {
      return standardError(new Error('Already at this stage'), {userId: viewerId})
    }
    startStage_(facilitatorStage)
    unlockedStageIds = unlockNextStages(facilitatorStageId, phases)
  }

  // RESOLUTION
  await getKysely()
    .updateTable('NewMeeting')
    .set({
      facilitatorStageId: facilitatorStageId ?? undefined,
      phases: JSON.stringify(phases)
    })
    .where('id', '=', meetingId)
    .execute()
  dataLoader.clearAll('newMeetings')

  const data = {
    meetingId,
    oldFacilitatorStageId: meeting.facilitatorStageId,
    facilitatorStageId,
    unlockedStageIds,
    ...phaseCompleteData
  }
  publish(SubscriptionChannel.TEAM, teamId, 'NavigateMeetingPayload', data, subOptions)
  return data
}

export default navigateMeeting
