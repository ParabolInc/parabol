import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getGroupSmartTitle from '~/utils/smartGroup/getGroupSmartTitle'
import {CHECKIN, DISCUSS, GROUP, REFLECT, VOTE} from '../../../client/utils/constants'
import getRethink from '../../database/rethinkDriver'
import DiscussPhase from '../../database/types/DiscussPhase'
import GenericMeetingPhase from '../../database/types/GenericMeetingPhase'
import MeetingRetrospective from '../../database/types/MeetingRetrospective'
import Reflection from '../../database/types/Reflection'
import ReflectionGroup from '../../database/types/ReflectionGroup'
import generateUID from '../../generateUID'
import {getUserId} from '../../utils/authorization'
import getPhase from '../../utils/getPhase'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import ResetRetroMeetingToReflectStagePayload from '../types/ResetRetroMeetingToReflectStagePayload'
import {primePhases} from './helpers/createNewMeetingPhases'

const resetRetroMeetingToReflectStage = {
  type: new GraphQLNonNull(ResetRetroMeetingToReflectStagePayload),
  description: `Reset a retro meeting to reflect stage`,
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
    const reflectPhase = phases.find((phase) => phase.phaseType === REFLECT)
    if (!reflectPhase)
      return standardError(new Error('Reflect phase not found'), {userId: viewerId})
    const resetToStage = reflectPhase.stages.find((stage) => stage.phaseType === REFLECT)
    if (!resetToStage)
      return standardError(new Error('Reflect stage not found'), {userId: viewerId})
    if (!resetToStage.isNavigableByFacilitator)
      return standardError(new Error('Reflect stage has not started'), {userId: viewerId})
    if (!resetToStage.isComplete)
      return standardError(new Error('Reflect stage has not finished'), {userId: viewerId})
    if (meeting.endedAt)
      return standardError(new Error('The meeting has already ended'), {userId: viewerId})

    // RESOLUTION
    const discussionPhase = getPhase(phases, DISCUSS)
    const discussionIdsToDelete =
      discussionPhase?.stages?.map(({discussionId}) => discussionId) ?? []
    let resetToPhaseIndex = -1

    const newPhases = phases.map((phase, index) => {
      switch (phase.phaseType) {
        case CHECKIN: {
          return phase
        }
        case REFLECT: {
          resetToPhaseIndex = index
          const newReflectPhase = new GenericMeetingPhase(phase.phaseType)
          newReflectPhase.id = phase.id
          // reflect phase always has a stage
          newReflectPhase.stages[0]!.id = phase.stages[0]!.id
          return newReflectPhase
        }
        case GROUP: {
          const newGroupPhase = new GenericMeetingPhase(phase.phaseType)
          newGroupPhase.id = phase.id
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

    const reflections = await dataLoader.get('retroReflectionsByMeetingId').load(meetingId)

    const newRefectionGroups = [] as ReflectionGroup[]
    const reflectionUpdates = [] as Partial<Reflection>[]

    reflections.forEach((reflection, index) => {
      const reflectionGroupId = generateUID()
      const smartTitle = getGroupSmartTitle([reflection])
      const newReflectionGroup = new ReflectionGroup({
        id: reflectionGroupId,
        smartTitle,
        title: smartTitle,
        meetingId,
        promptId: reflection.promptId,
        sortOrder: index + 1
      })

      newRefectionGroups.push(newReflectionGroup)

      // mutates the dataloader response
      reflection.reflectionGroupId = reflectionGroupId
      reflectionUpdates.push({id: reflection.id, reflectionGroupId})
    })

    await Promise.all([
      r
        .table('Comment')
        .getAll(r.args(discussionIdsToDelete), {index: 'discussionId'})
        .delete()
        .run(),
      r.table('Task').getAll(r.args(discussionIdsToDelete), {index: 'discussionId'}).delete().run(),
      r
        .table('RetroReflectionGroup')
        // .getAll(r.args(reflectionGroupIds))
        .getAll(meetingId, {index: 'meetingId'})
        .delete()
        .run(),
      r.table('RetroReflection').insert(reflectionUpdates, {conflict: 'update'}).run(),
      r.table('NewMeeting').get(meetingId).update({phases: newPhases}).run(),
      (r.table('MeetingMember').getAll(meetingId, {index: 'meetingId'}) as any)
        .update({votesRemaining: meeting.totalVotes})
        .run()
    ])

    await r.table('RetroReflectionGroup').insert(newRefectionGroups).run()

    const data = {
      meetingId
    }
    publish(
      SubscriptionChannel.MEETING,
      meetingId,
      'ResetRetroMeetingToReflectStagePayload',
      data,
      subOptions
    )
    return data
  }
}

export default resetRetroMeetingToReflectStage
