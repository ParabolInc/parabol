import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {CHECKIN, DISCUSS, GROUP, REFLECT, UPDATES, VOTE} from '../../../../client/utils/constants'
import DiscussPhase from '../../../database/types/DiscussPhase'
import GenericMeetingPhase from '../../../database/types/GenericMeetingPhase'
import getKysely from '../../../postgres/getKysely'
import type {RetroMeetingPhase} from '../../../postgres/types/NewMeetingPhase'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import {primePhases} from '../../mutations/helpers/createNewMeetingPhases'
import type {MutationResolvers} from '../resolverTypes'

const resetRetroMeetingToGroupStage: MutationResolvers['resetRetroMeetingToGroupStage'] = async (
  _source,
  {meetingId},
  {socketId: mutatorId, dataLoader}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
  const {phases, meetingType} = meeting
  if (meetingType !== 'retrospective') {
    throw new GraphQLError('Meeting type is not retrospective', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }

  // VALIDATION
  const groupPhase = phases.find((phase) => phase.phaseType === GROUP)
  if (!groupPhase)
    throw new GraphQLError('Group phase not found', {extensions: {code: 'NOT_FOUND'}})
  const resetToStage = groupPhase.stages.find((stage) => stage.phaseType === GROUP)
  if (!resetToStage)
    throw new GraphQLError('Group stage not found', {extensions: {code: 'NOT_FOUND'}})
  if (!resetToStage.isNavigableByFacilitator)
    throw new GraphQLError('Group stage has not started', {extensions: {code: 'CONFLICT'}})
  if (!resetToStage.isComplete)
    throw new GraphQLError('Group stage has not finished', {extensions: {code: 'CONFLICT'}})
  if (meeting.endedAt)
    throw new GraphQLError('The meeting has already ended', {extensions: {code: 'CONFLICT'}})

  // RESOLUTION
  const discussionPhase = getPhase(phases, DISCUSS)
  const discussionIdsToDelete = discussionPhase?.stages?.map(({discussionId}) => discussionId) ?? []
  let resetToPhaseIndex = -1

  const newPhases = phases.map((phase, index) => {
    switch (phase.phaseType) {
      case CHECKIN:
      case 'TEAM_HEALTH':
      case UPDATES:
      case REFLECT:
        return phase
      case GROUP: {
        resetToPhaseIndex = index
        const newGroupPhase = new GenericMeetingPhase(phase.phaseType)
        newGroupPhase.id = phase.id
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
  }) as RetroMeetingPhase[]

  primePhases(newPhases, resetToPhaseIndex)
  meeting.phases = newPhases

  const reflectionGroups = await dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId)
  const reflectionGroupIds = reflectionGroups.map((rg) => rg.id)
  reflectionGroups.forEach((rg) => (rg.voterIds = []))

  if (discussionIdsToDelete.length > 0) {
    await pg
      .with('DeleteComments', (qb) =>
        qb.deleteFrom('Comment').where('discussionId', 'in', discussionIdsToDelete)
      )
      .deleteFrom('Task')
      .where('discussionId', 'in', discussionIdsToDelete)
      .execute()
  }
  if (reflectionGroupIds.length > 0) {
    await pg
      .updateTable('RetroReflectionGroup')
      .set({voterIds: [], discussionPromptQuestion: null})
      .where('id', 'in', reflectionGroupIds)
      .execute()
  }
  await pg
    .with('ResetMeetingMember', (qb) =>
      qb
        .updateTable('MeetingMember')
        .set({votesRemaining: meeting.totalVotes})
        .where('meetingId', '=', meetingId)
    )
    .updateTable('NewMeeting')
    .set({phases: JSON.stringify(newPhases)})
    .where('id', '=', meetingId)
    .execute()
  dataLoader.clearAll([
    'newMeetings',
    'comments',
    'retroReflectionGroups',
    'tasks',
    'meetingMembers'
  ])
  const data = {meetingId}
  publish(
    SubscriptionChannel.MEETING,
    meetingId,
    'ResetRetroMeetingToGroupStagePayload',
    data,
    subOptions
  )
  return data
}

export default resetRetroMeetingToGroupStage
