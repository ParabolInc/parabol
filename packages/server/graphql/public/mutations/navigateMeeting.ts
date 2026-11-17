import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import startStage_ from 'parabol-client/utils/startStage_'
import unlockNextStages from 'parabol-client/utils/unlockNextStages'
import getKysely from '../../../postgres/getKysely'
import {Logger} from '../../../utils/Logger'
import publish from '../../../utils/publish'
import handleCompletedStage from '../../mutations/helpers/handleCompletedStage'
import removeScheduledJobs from '../../mutations/helpers/removeScheduledJobs'
import type {MutationResolvers} from '../resolverTypes'

const navigateMeeting: MutationResolvers['navigateMeeting'] = async (
  _source,
  {completedStageId, facilitatorStageId, meetingId},
  {socketId: mutatorId, dataLoader}
) => {
  const now = new Date()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
  const {
    endedAt,
    facilitatorUserId: nullableFacilitatorUserId,
    phases,
    teamId,
    meetingType
  } = meeting
  const facilitatorUserId = nullableFacilitatorUserId!
  if (endedAt) throw new GraphQLError('Meeting already ended', {extensions: {code: 'CONFLICT'}})

  // VALIDATION
  let phaseCompleteData
  let unlockedStageIds
  if (completedStageId) {
    const completedStageRes = findStageById(phases, completedStageId)
    if (!completedStageRes) {
      throw new GraphQLError('Meeting stage not found', {extensions: {code: 'NOT_FOUND'}})
    }
    const {stage} = completedStageRes
    if (!stage.isNavigableByFacilitator) {
      throw new GraphQLError('Stage has not started', {extensions: {code: 'CONFLICT'}})
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
      throw new GraphQLError('Stage not found', {extensions: {code: 'NOT_FOUND'}})
    }
    const {stage: facilitatorStage} = facilitatorStageRes
    if (!facilitatorStage.isNavigableByFacilitator) {
      throw new GraphQLError('Stage has not started', {extensions: {code: 'CONFLICT'}})
    }
    if (meeting.facilitatorStageId === facilitatorStageId) {
      throw new GraphQLError('Already at this stage', {extensions: {code: 'CONFLICT'}})
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
