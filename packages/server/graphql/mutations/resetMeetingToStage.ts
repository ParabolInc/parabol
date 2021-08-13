import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import {DISCUSS, GROUP, VOTE} from '../../../client/utils/constants'
import getRethink from '../../database/rethinkDriver'
import DiscussPhase from '../../database/types/DiscussPhase'
import DiscussStage from '../../database/types/DiscussStage'
import GenericMeetingPhase, {
  NewMeetingPhaseTypeEnum
} from '../../database/types/GenericMeetingPhase'
import GenericMeetingStage from '../../database/types/GenericMeetingStage'
import MeetingRetrospective from '../../database/types/MeetingRetrospective'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import ResetMeetingToStagePayload from '../types/ResetMeetingToStagePayload'
import {primePhases} from './helpers/createNewMeetingPhases'

const resetMeetingPhase = (phase: GenericMeetingPhase) => {
  const newStages = phase.stages.map(({id}) => {
    const newStage =
      phase.phaseType === DISCUSS
        ? new DiscussStage({sortOrder: 0, reflectionGroupId: ''})
        : new GenericMeetingStage({phaseType: phase.phaseType})
    newStage.id = id
    return newStage
  })
  phase.stages = newStages
}

const resetMeetingToStage = {
  type: GraphQLNonNull(ResetMeetingToStagePayload),
  description: `Reset a retro meeting to group stage`,
  args: {
    meetingId: {
      type: GraphQLNonNull(GraphQLID)
    },
    stageId: {
      type: GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (_source, {meetingId, stageId}, {authToken, socketId: mutatorId, dataLoader}) => {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)
    const meeting = (await dataLoader.get('newMeetings').load(meetingId)) as MeetingRetrospective
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {createdBy, facilitatorUserId, phases, meetingType} = meeting
    if (meetingType != 'retrospective') {
      return standardError(new Error('Meeting type is not retrospective'), {userId: viewerId})
    }
    if (viewerId !== facilitatorUserId) {
      if (viewerId !== createdBy)
        return standardError(new Error('Not meeting facilitator'), {userId: viewerId})
      return standardError(new Error('Not meeting facilitator anymore'), {userId: viewerId})
    }

    // VALIDATION
    const foundResponse = findStageById(phases, stageId)
    if (!foundResponse)
      return standardError(new Error('Meeting stage not found'), {userId: viewerId})
    const {stage: resetToStage} = foundResponse
    if (!resetToStage.isNavigableByFacilitator)
      return standardError(new Error('Stage has not started'), {userId: viewerId})
    if (!resetToStage.isComplete)
      return standardError(new Error('Stage has not finished'), {userId: viewerId})
    if ((resetToStage.phaseType as NewMeetingPhaseTypeEnum) !== 'group')
      return standardError(new Error('Resetting to this stage type is not supported'), {
        userId: viewerId
      })
    if (meeting.endedAt)
      return standardError(new Error('The meeting has already ended'), {userId: viewerId})

    // RESOLUTION
    let discussionIds = [] as string[]
    let resetToPhaseIndex = -1
    const newPhases = [] as GenericMeetingPhase[]
    for (const [phaseIndex, phase] of phases.entries()) {
      const {phaseType} = phase
      switch (phaseType) {
        case GROUP: {
          resetToPhaseIndex = phaseIndex
          resetMeetingPhase(phase)
          break
        }
        case VOTE: {
          resetMeetingPhase(phase)
          break
        }
        case DISCUSS: {
          discussionIds = (phase as DiscussPhase).stages.map(({discussionId}) => discussionId) ?? []
          resetMeetingPhase(phase)
          break
        }
      }
      newPhases.push(phase)
    }
    primePhases(newPhases, resetToPhaseIndex)
    meeting.phases = newPhases

    const reflectionGroups = await dataLoader
      .get('retroReflectionGroupsByMeetingId')
      .load(meetingId)
    const reflectionGroupIds = reflectionGroups.map((rg) => rg.id)
    // bc we return the reflection groups cached by data loader in the fragment
    reflectionGroups.forEach((rg) => (rg.voterIds = []))

    await Promise.all([
      r
        .table('Comment')
        .getAll(r.args(discussionIds), {index: 'discussionId'})
        .delete()
        .run(),
      r
        .table('Task')
        .getAll(r.args(discussionIds), {index: 'discussionId'})
        .delete()
        .run(),
      r
        .table('RetroReflectionGroup')
        .getAll(r.args(reflectionGroupIds))
        .update({voterIds: []})
        .run(),
      r
        .table('NewMeeting')
        .get(meetingId)
        .update({phases: newPhases})
        .run(),
      (r.table('MeetingMember').getAll(meetingId, {index: 'meetingId'}) as any)
        .update({votesRemaining: meeting.totalVotes})
        .run()
    ])
    const data = {
      meetingId
    }
    publish(SubscriptionChannel.MEETING, meetingId, 'ResetMeetingToStagePayload', data, subOptions)
    return data
  }
}

export default resetMeetingToStage
