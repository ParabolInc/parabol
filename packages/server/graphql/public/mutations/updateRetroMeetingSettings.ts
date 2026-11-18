import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {isNotNull} from 'parabol-client/utils/predicates'
import {positionAfter} from '../../../../client/shared/sortOrder'
import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import UpdatesPhase from '../../../database/types/UpdatesPhase'
import UpdatesStage from '../../../database/types/UpdatesStage'
import getKysely from '../../../postgres/getKysely'
import type {NewMeetingPhase} from '../../../postgres/types/NewMeetingPhase'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'
import getNextMeetingSettings from './helpers/getNextMeetingSettings'

const hasStarted = (phase: NewMeetingPhase) => phase.stages.some((stage) => !!stage.startAt)

// Adds or removes the Review Tasks phase, which sits right before Reflect, while neither has started.
// Returns null when the meeting is past that point
const toggleUpdatesPhase = (
  phases: NewMeetingPhase[],
  isEnabled: boolean,
  createPhase: () => NewMeetingPhase
) => {
  const reflectIdx = phases.findIndex((phase) => phase.phaseType === 'reflect')
  const reflectPhase = phases[reflectIdx]
  if (!reflectPhase || hasStarted(reflectPhase)) return null
  const updatesIdx = phases.findIndex((phase) => phase.phaseType === 'updates')
  const updatesPhase = phases[updatesIdx]
  if (updatesPhase && hasStarted(updatesPhase)) return null
  if (isEnabled === !!updatesPhase) return phases
  const [reflectStage] = reflectPhase.stages
  if (isEnabled) {
    const nextPhase = createPhase()
    // whatever made Reflect the next stop for the facilitator now applies to Review Tasks instead
    const [firstStage] = nextPhase.stages
    if (firstStage && reflectStage) {
      firstStage.isNavigableByFacilitator = reflectStage.isNavigableByFacilitator
    }
    return [...phases.slice(0, reflectIdx), nextPhase, ...phases.slice(reflectIdx)]
  }
  const firstUpdatesStage = updatesPhase!.stages[0]
  if (firstUpdatesStage?.isNavigableByFacilitator && reflectStage) {
    reflectStage.isNavigableByFacilitator = true
  }
  return phases.filter((_, idx) => idx !== updatesIdx)
}

const updateRetroMeetingSettings: MutationResolvers['updateRetroMeetingSettings'] = async (
  _source,
  {meetingId, checkinEnabled, reviewPastTasksEnabled, disableAnonymity},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const pg = getKysely()

  // VALIDATION
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
  if (meeting.meetingType !== 'retrospective') {
    throw new GraphQLError('Only a retrospective has these settings', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  if (meeting.endedAt) {
    throw new GraphQLError('The meeting has ended', {extensions: {code: 'CONFLICT'}})
  }
  const {teamId, meetingSeriesId, facilitatorUserId} = meeting
  const [series, settings, reflections, meetingMembers] = await Promise.all([
    meetingSeriesId ? dataLoader.get('meetingSeries').load(meetingSeriesId) : null,
    dataLoader.get('meetingSettingsByType').loadNonNull({teamId, meetingType: 'retrospective'}),
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId),
    dataLoader.get('meetingMembersByMeetingId').load(meetingId)
  ])
  const isRecurring = !!series && !series.cancelledAt

  // RESOLUTION
  await pg.transaction().execute(async (trx) => {
    const locked = await trx
      .selectFrom('NewMeeting')
      .select(({fn}) => fn<NewMeetingPhase[]>('to_json', ['phases']).as('phases'))
      .where('id', '=', meetingId)
      .forUpdate()
      .executeTakeFirstOrThrow()
    let {phases} = locked
    let isMeetingChanged = false

    if (isNotNull(reviewPastTasksEnabled)) {
      const createPhase = () => {
        const userIds = [
          ...(facilitatorUserId ? [facilitatorUserId] : []),
          ...meetingMembers
            .filter(({userId}) => userId !== facilitatorUserId)
            .map(({userId}) => userId)
        ]
        const memberIds = userIds.map((userId) => toTeamMemberId(teamId, userId))
        let sortOrder = ''
        const stages = memberIds.map((teamMemberId) => {
          sortOrder = positionAfter(sortOrder)
          return new UpdatesStage(teamMemberId, sortOrder)
        }) as [UpdatesStage, ...UpdatesStage[]]
        return new UpdatesPhase({durations: undefined, stages}) as NewMeetingPhase
      }
      const nextPhases = toggleUpdatesPhase(phases, reviewPastTasksEnabled, createPhase)
      if (nextPhases) {
        isMeetingChanged = nextPhases !== phases
        phases = nextPhases
      } else if (!isRecurring) {
        throw new GraphQLError('Reflect has already started', {extensions: {code: 'CONFLICT'}})
      }
    }

    if (isNotNull(checkinEnabled) && !isRecurring) {
      throw new GraphQLError('The icebreaker has already started', {
        extensions: {code: 'CONFLICT'}
      })
    }

    let nextDisableAnonymity: boolean | undefined
    if (isNotNull(disableAnonymity)) {
      const reflectPhase = phases.find((phase) => phase.phaseType === 'reflect')
      const isReflectDone = !reflectPhase || reflectPhase.stages.every((stage) => stage.isComplete)
      if (reflections.length === 0 && !isReflectDone) {
        nextDisableAnonymity = disableAnonymity
      } else if (!isRecurring) {
        throw new GraphQLError('Someone already added a reflection', {
          extensions: {code: 'CONFLICT'}
        })
      }
    }

    if (isMeetingChanged || nextDisableAnonymity !== undefined) {
      await trx
        .updateTable('NewMeeting')
        .set({
          phases: isMeetingChanged ? JSON.stringify(phases) : undefined,
          disableAnonymity: nextDisableAnonymity
        })
        .where('id', '=', meetingId)
        .execute()
    }

    if (isRecurring) {
      await trx
        .updateTable('MeetingSettings')
        .set(
          getNextMeetingSettings(settings, {
            checkinEnabled,
            reviewPastTasksEnabled,
            disableAnonymity
          })
        )
        .where('id', '=', settings.id)
        .execute()
    }
  })
  dataLoader.clearAll(['newMeetings', 'meetingSettings'])

  const data = {meetingId, settingsId: settings.id}
  publish(
    SubscriptionChannel.MEETING,
    meetingId,
    'UpdateRetroMeetingSettingsPayload',
    data,
    subOptions
  )
  if (isRecurring) {
    publish(
      SubscriptionChannel.TEAM,
      teamId,
      'SetMeetingSettingsPayload',
      {settingsId: settings.id},
      subOptions
    )
  }
  return data
}

export default updateRetroMeetingSettings
