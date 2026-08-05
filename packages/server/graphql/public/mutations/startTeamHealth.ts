import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {RRuleSet} from 'rrule-rust'
import getKysely from '../../../postgres/getKysely'
import updateMeetingTemplateLastUsedAt from '../../../postgres/queries/updateMeetingTemplateLastUsedAt'
import {type AnalyticsUser, analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import {isImmediateOccurrence} from '../../../utils/isImmediateOccurrence'
import publish from '../../../utils/publish'
import RedisLockQueue from '../../../utils/RedisLockQueue'
import type {DataLoaderWorker} from '../../graphql'
import createGcalEvent from '../../mutations/helpers/createGcalEvent'
import isStartMeetingLocked from '../../mutations/helpers/isStartMeetingLocked'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import safeCreateTeamHealth from '../../mutations/helpers/safeCreateTeamHealth'
import type {CreateGcalEventInput, MutationResolvers} from '../resolverTypes'
import {createMeetingMember} from './joinMeeting'
import {createMeetingSeries, startNewMeetingSeries} from './updateRecurrenceSettings'

const meetingType = 'teamHealth' as const

type StartForTeamParams = {
  teamId: string
  viewerId: string
  viewer: AnalyticsUser
  templateId: string
  name?: string | null
  rrule: RRuleSet | null
  gcalInput?: CreateGcalEventInput | null
}

// Schedules or starts a single team's health meeting. Returns the started meetingId, or null when
// only a future series was scheduled (no meeting yet). Returns undefined when nothing could start.
const startTeamHealthForTeam = async (
  params: StartForTeamParams,
  dataLoader: DataLoaderWorker
): Promise<string | null | undefined> => {
  const {teamId, viewerId, viewer, templateId, name, rrule, gcalInput} = params
  const pg = getKysely()
  const seriesName = name || 'Team Health'

  const unpaidError = await isStartMeetingLocked(teamId, dataLoader)
  if (unpaidError) return undefined

  // Recurring series that starts in the future: create the series only, the meeting is spawned later
  // by processRecurrence when the rrule fires.
  if (rrule && !isImmediateOccurrence(rrule)) {
    const scheduleLock = new RedisLockQueue(`newMeetingSeries:${teamId}`, 3000)
    try {
      await scheduleLock.lock(0)
    } catch {
      return undefined
    }
    const meetingSeries = await createMeetingSeries({
      meetingType,
      title: seriesName,
      recurrenceRule: rrule,
      teamId,
      facilitatorId: viewerId
    })
    analytics.recurrenceStarted(viewer, meetingSeries)
    await pg
      .updateTable('MeetingSettings')
      .set({selectedTemplateId: templateId})
      .where('teamId', '=', teamId)
      .where('meetingType', '=', meetingType)
      .execute()
    const {gcalSeriesId} = await createGcalEvent({
      name: seriesName,
      gcalInput,
      meetingId: null,
      meetingSeriesId: meetingSeries.id,
      teamId,
      viewerId,
      rrule,
      dataLoader
    })
    if (gcalSeriesId) {
      await pg
        .updateTable('MeetingSeries')
        .set({gcalSeriesId})
        .where('id', '=', meetingSeries.id)
        .execute()
    }
    return null
  }

  const meeting = await safeCreateTeamHealth(
    {teamId, facilitatorUserId: viewerId, templateId, name: name ?? undefined},
    dataLoader
  )
  if (!meeting) return undefined

  const meetingId = meeting.id
  const meetingMember = createMeetingMember(meeting, {
    userId: viewerId,
    teamId,
    isSpectatingPoker: false
  })
  const [meetingSeries] = await Promise.all([
    rrule && startNewMeetingSeries(meeting, rrule, seriesName),
    pg
      .with('TeamUpdates', (qb) =>
        qb.updateTable('Team').set({lastMeetingType: meetingType}).where('id', '=', teamId)
      )
      .insertInto('MeetingMember')
      .values(meetingMember)
      .execute(),
    pg
      .updateTable('MeetingSettings')
      .set({selectedTemplateId: templateId})
      .where('teamId', '=', teamId)
      .where('meetingType', '=', meetingType)
      .execute(),
    updateMeetingTemplateLastUsedAt(templateId, teamId)
  ])
  dataLoader.get('newMeetings').clear(meetingId)
  dataLoader.get('activeMeetingsByTeamId').clear(teamId)

  if (meetingSeries) {
    analytics.recurrenceStarted(viewer, meetingSeries)
  }
  IntegrationNotifier.startMeeting(dataLoader, meetingId, teamId)
  analytics.meetingStarted(viewer, meeting)

  const {gcalSeriesId} = await createGcalEvent({
    name: seriesName,
    gcalInput,
    meetingId,
    meetingSeriesId: meetingSeries ? meetingSeries.id : null,
    teamId,
    viewerId,
    rrule,
    dataLoader
  })
  if (meetingSeries && gcalSeriesId) {
    await pg
      .updateTable('MeetingSeries')
      .set({gcalSeriesId})
      .where('id', '=', meetingSeries.id)
      .execute()
  }

  return meetingId
}

const startTeamHealth: MutationResolvers['startTeamHealth'] = async (
  _source,
  {teamIds, templateId, name, rrule: rruleString, gcalInput},
  {authToken, socketId: mutatorId, dataLoader}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const rrule = rruleString ? RRuleSet.parse(rruleString) : null

  // AUTH
  const viewerId = getUserId(authToken)
  const uniqueTeamIds = [...new Set(teamIds)]
  if (uniqueTeamIds.length === 0) {
    throw new GraphQLError('No teams selected')
  }

  const [viewer, teams] = await Promise.all([
    dataLoader.get('users').loadNonNull(viewerId),
    dataLoader.get('teams').loadMany(uniqueTeamIds)
  ])

  // RESOLUTION
  const startedTeamIds: string[] = []
  const meetingIds: string[] = []
  const startedTeams: {teamId: string; meetingIds: string[]}[] = []
  for (const teamId of uniqueTeamIds) {
    const team = teams.find((t) => t && !(t instanceof Error) && t.id === teamId)
    if (!team || team instanceof Error) continue

    const result = await startTeamHealthForTeam(
      {teamId, viewerId, viewer, templateId, name, rrule, gcalInput},
      dataLoader
    )
    if (result === undefined) continue

    startedTeamIds.push(teamId)
    if (result) meetingIds.push(result)
    startedTeams.push({teamId, meetingIds: result ? [result] : []})
  }

  if (startedTeamIds.length === 0) {
    throw new GraphQLError('Meeting already started')
  }

  // Publish after all dataLoader work is done: a dataLoader can't be accessed once publish is called
  for (const {teamId, meetingIds: teamMeetingIds} of startedTeams) {
    publish(
      SubscriptionChannel.TEAM,
      teamId,
      'StartTeamHealthSuccess',
      {meetingIds: teamMeetingIds, teamIds: [teamId]},
      subOptions
    )
  }

  return {meetingIds, teamIds: startedTeamIds}
}

export default startTeamHealth
