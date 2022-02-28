import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {CHECKIN, DISCUSS, GROUP, REFLECT, VOTE} from '../../../client/utils/constants'
import getRethink from '../../database/rethinkDriver'
import DiscussPhase from '../../database/types/DiscussPhase'
import GenericMeetingPhase from '../../database/types/GenericMeetingPhase'
import MeetingRetrospective from '../../database/types/MeetingRetrospective'
import {getUserId} from '../../utils/authorization'
import getPhase from '../../utils/getPhase'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import ResetRetroMeetingToGroupStagePayload from '../types/ResetRetroMeetingToGroupStagePayload'
import {primePhases} from './helpers/createNewMeetingPhases'

const resetRetroMeetingToGroupStage = {
  type: new GraphQLNonNull(ResetRetroMeetingToGroupStagePayload),
  description: `Reset a retro meeting to group stage`,
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (
    _source: unknown,
    {meetingId}: {meetingId: string},
    {authToken, socketId: mutatorId, dataLoader}: GQLContext
  ) => {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)
    const meeting = (await dataLoader.get('newMeetings').load(meetingId)) as MeetingRetrospective
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {createdBy, facilitatorUserId, phases, meetingType} = meeting
    if (meetingType !== 'retrospective') {
      return standardError(new Error('Meeting type is not retrospective'), {userId: viewerId})
    }
    if (viewerId !== facilitatorUserId) {
      if (viewerId !== createdBy)
        return standardError(new Error('Not meeting facilitator'), {userId: viewerId})
      return standardError(new Error('Not meeting facilitator anymore'), {userId: viewerId})
    }

    // VALIDATION
    const groupPhase = phases.find((phase) => phase.phaseType === GROUP)
    if (!groupPhase) return standardError(new Error('Group phase not found'), {userId: viewerId})
    const resetToStage = groupPhase.stages.find((stage) => stage.phaseType === GROUP)
    if (!resetToStage) return standardError(new Error('Group stage not found'), {userId: viewerId})
    if (!resetToStage.isNavigableByFacilitator)
      return standardError(new Error('Group stage has not started'), {userId: viewerId})
    if (!resetToStage.isComplete)
      return standardError(new Error('Group stage has not finished'), {userId: viewerId})
    if (meeting.endedAt)
      return standardError(new Error('The meeting has already ended'), {userId: viewerId})

    // RESOLUTION
    const discussionPhase = getPhase(phases, DISCUSS)
    const discussionIdsToDelete =
      discussionPhase?.stages?.map(({discussionId}) => discussionId) ?? []
    let resetToPhaseIndex = -1

    const newPhases = phases.map((phase, index) => {
      switch (phase.phaseType) {
        case CHECKIN:
        case REFLECT:
          return phase
        case GROUP: {
          resetToPhaseIndex = index
          const newGroupPhase = new GenericMeetingPhase(phase.phaseType)
          newGroupPhase.id = phase.id
          // group phase always has a stage
          newGroupPhase.stages[0]!.id = phase.stages[0]!.id
          return newGroupPhase
        }
        case VOTE: {
          const newVotePhase = new GenericMeetingPhase(phase.phaseType)
          newVotePhase.id = phase.id
          return newVotePhase
        }
        case DISCUSS: {
          const newDiscussPhase = new DiscussPhase([])
          newDiscussPhase.id = phase.id
          return newDiscussPhase
        }
        default:
          throw new Error(`Unhandled phaseType: ${phase.phaseType}`)
      }
    })

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
        .getAll(r.args(discussionIdsToDelete), {index: 'discussionId'})
        .delete()
        .run(),
      r.table('Task').getAll(r.args(discussionIdsToDelete), {index: 'discussionId'}).delete().run(),
      r
        .table('RetroReflectionGroup')
        .getAll(r.args(reflectionGroupIds))
        .update({voterIds: []})
        .run(),
      r.table('NewMeeting').get(meetingId).update({phases: newPhases}).run(),
      (r.table('MeetingMember').getAll(meetingId, {index: 'meetingId'}) as any)
        .update({votesRemaining: meeting.totalVotes})
        .run()
    ])
    const data = {
      meetingId
    }
    publish(
      SubscriptionChannel.MEETING,
      meetingId,
      'ResetRetroMeetingToGroupStagePayload',
      data,
      subOptions
    )
    return data
  }
}

export default resetRetroMeetingToGroupStage
