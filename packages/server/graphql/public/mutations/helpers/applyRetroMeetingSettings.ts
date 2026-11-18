import {GraphQLError} from 'graphql'
import {isNotNull} from 'parabol-client/utils/predicates'
import {positionAfter} from '../../../../../client/shared/sortOrder'
import toTeamMemberId from '../../../../../client/utils/relay/toTeamMemberId'
import UpdatesPhase from '../../../../database/types/UpdatesPhase'
import UpdatesStage from '../../../../database/types/UpdatesStage'
import getKysely from '../../../../postgres/getKysely'
import type {MeetingSettings} from '../../../../postgres/types'
import type {RetrospectiveMeeting} from '../../../../postgres/types/Meeting'
import type {NewMeetingPhase} from '../../../../postgres/types/NewMeetingPhase'
import type {DataLoaderWorker} from '../../../graphql'
import getNextMeetingSettings from './getNextMeetingSettings'

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

interface SettingsChange {
  checkinEnabled?: boolean | null
  teamHealthEnabled?: boolean | null
  reviewPastTasksEnabled?: boolean | null
  disableAnonymity?: boolean | null
}

interface Options {
  meeting: RetrospectiveMeeting
  settings: MeetingSettings
  // only a meeting that repeats has future meetings to change
  isRecurring: boolean
  change: SettingsChange
  dataLoader: DataLoaderWorker
}

// Each change applies to the meeting while it still can, and to the team's next retros when the
// meeting repeats. A change that can apply to neither throws before anything is written
const applyRetroMeetingSettings = async (options: Options) => {
  const {meeting, settings, isRecurring, change, dataLoader} = options
  const {checkinEnabled, teamHealthEnabled, reviewPastTasksEnabled, disableAnonymity} = change
  const {id: meetingId, teamId, facilitatorUserId} = meeting
  const [reflections, meetingMembers] = await Promise.all([
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId),
    dataLoader.get('meetingMembersByMeetingId').load(meetingId)
  ])
  if (!isRecurring && (isNotNull(checkinEnabled) || isNotNull(teamHealthEnabled))) {
    throw new GraphQLError('The meeting has already started', {extensions: {code: 'CONFLICT'}})
  }

  await getKysely()
    .transaction()
    .execute(async (trx) => {
      const locked = await trx
        .selectFrom('NewMeeting')
        .select(({fn}) => fn<NewMeetingPhase[]>('to_json', ['phases']).as('phases'))
        .where('id', '=', meetingId)
        .forUpdate()
        .executeTakeFirstOrThrow()
      let {phases} = locked
      let isPhasesChanged = false

      if (isNotNull(reviewPastTasksEnabled)) {
        const createPhase = () => {
          const userIds = [
            ...(facilitatorUserId ? [facilitatorUserId] : []),
            ...meetingMembers
              .filter(({userId}) => userId !== facilitatorUserId)
              .map(({userId}) => userId)
          ]
          let sortOrder = ''
          const stages = userIds.map((userId) => {
            sortOrder = positionAfter(sortOrder)
            return new UpdatesStage(toTeamMemberId(teamId, userId), sortOrder)
          }) as [UpdatesStage, ...UpdatesStage[]]
          return new UpdatesPhase({durations: undefined, stages}) as NewMeetingPhase
        }
        const nextPhases = toggleUpdatesPhase(phases, reviewPastTasksEnabled, createPhase)
        if (nextPhases) {
          isPhasesChanged = nextPhases !== phases
          phases = nextPhases
        } else if (!isRecurring) {
          throw new GraphQLError('Reflect has already started', {extensions: {code: 'CONFLICT'}})
        }
      }

      let nextDisableAnonymity: boolean | undefined
      if (isNotNull(disableAnonymity)) {
        const reflectPhase = phases.find((phase) => phase.phaseType === 'reflect')
        const isReflectDone =
          !reflectPhase || reflectPhase.stages.every((stage) => stage.isComplete)
        if (reflections.length === 0 && !isReflectDone) {
          nextDisableAnonymity = disableAnonymity
        } else if (!isRecurring) {
          throw new GraphQLError('Someone already added a reflection', {
            extensions: {code: 'CONFLICT'}
          })
        }
      }

      if (isPhasesChanged || nextDisableAnonymity !== undefined) {
        await trx
          .updateTable('NewMeeting')
          .set({
            phases: isPhasesChanged ? JSON.stringify(phases) : undefined,
            disableAnonymity: nextDisableAnonymity
          })
          .where('id', '=', meetingId)
          .execute()
      }
      if (isRecurring) {
        await trx
          .updateTable('MeetingSettings')
          .set(getNextMeetingSettings(settings, change))
          .where('id', '=', settings.id)
          .execute()
      }
    })
  dataLoader.clearAll(['newMeetings', 'meetingSettings'])
}

export default applyRetroMeetingSettings
