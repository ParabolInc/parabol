import {randomUUIDv7} from 'crypto'
import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {RRuleSet} from 'rrule-rust'
import getKysely from '../../../postgres/getKysely'
import updateMeetingTemplateLastUsedAt from '../../../postgres/queries/updateMeetingTemplateLastUsedAt'
import {type AnalyticsUser, analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import {isImmediateOccurrence} from '../../../utils/isImmediateOccurrence'
import publish from '../../../utils/publish'
import RedisLockQueue from '../../../utils/RedisLockQueue'
import type {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'
import createGcalEvent from '../../mutations/helpers/createGcalEvent'
import getDefaultTeamFacilitator from '../../mutations/helpers/getDefaultTeamFacilitator'
import isStartMeetingLocked from '../../mutations/helpers/isStartMeetingLocked'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import rotateSeriesTeamHealthQuestionIds from '../../mutations/helpers/rotateSeriesTeamHealthQuestionIds'
import safeCreateTeamHealth from '../../mutations/helpers/safeCreateTeamHealth'
import type {CreateGcalEventInput, MutationResolvers} from '../resolverTypes'
import {createMeetingMember} from './joinMeeting'
import {createMeetingSeries, startNewMeetingSeries} from './updateRecurrenceSettings'

const meetingType = 'teamHealth' as const

type SeriesParams = {
  // shared by every sibling series of a group that covers several teams
  groupId: string | null
  // when set, only this user administers the series. See canAdminMeetingSeries
  ownerUserId: string | null
  templateId: string
}

type StartForTeamParams = {
  teamId: string
  facilitatorId: string
  viewerId: string
  viewer: AnalyticsUser
  templateId: string
  name?: string | null
  rrule: RRuleSet | null
  seriesParams: SeriesParams
  gcalInput?: CreateGcalEventInput | null
  questionIds?: number[]
}

// A team runs at most one meeting per occurrence, so these are singular. The mutation payload is
// plural only because one call can cover several teams.
type StartForTeamResult = {
  teamId: string
  meetingId: string | null
  meetingSeriesId: number | null
}

// Schedules or starts a single team's health meeting. Returns the started meetingId, or null when
// only a future series was scheduled (no meeting yet). Returns undefined when nothing could start.
const startTeamHealthForTeam = async (
  params: StartForTeamParams,
  dataLoader: DataLoaderWorker
): Promise<StartForTeamResult | undefined> => {
  const {
    teamId,
    facilitatorId,
    viewerId,
    templateId,
    name,
    rrule,
    seriesParams,
    gcalInput,
    questionIds
  } = params
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
      facilitatorId,
      ...seriesParams
    })
    await pg
      .updateTable('MeetingSettings')
      .set({selectedTemplateId: templateId})
      .where('teamId', '=', teamId)
      .where('meetingType', '=', meetingType)
      .execute()
    // this team's own invite, so the link in it names this team's series & not a sibling's
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
    return {teamId, meetingId: null, meetingSeriesId: meetingSeries.id}
  }

  const meeting = await safeCreateTeamHealth(
    {teamId, facilitatorUserId: facilitatorId, templateId, name: name ?? undefined, questionIds},
    dataLoader
  )
  if (!meeting) return undefined

  const meetingId = meeting.id
  const meetingMember = createMeetingMember(meeting, {
    userId: facilitatorId,
    teamId,
    isSpectatingPoker: false
  })
  const [meetingSeries] = await Promise.all([
    rrule && startNewMeetingSeries(meeting, rrule, seriesName, seriesParams),
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

  IntegrationNotifier.startMeeting(dataLoader, meetingId, teamId)
  analytics.meetingStarted(params.viewer, meeting)

  // this team's own invite, so the link in it names this team's series & not a sibling's
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

  return {teamId, meetingId, meetingSeriesId: meetingSeries ? meetingSeries.id : null}
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
  const validTeams = teams.filter(isValid)
  if (rrule && new Set(validTeams.map(({orgId}) => orgId)).size > 1) {
    // a series group is owned by one org: succession, the paid-tier gate, and tenancy are all
    // org-scoped. A one-off across orgs creates no series, so it stays allowed
    throw new GraphQLError('Pick teams from a single organization to schedule a recurring meeting')
  }

  // A series covering several teams, or one scheduled for a team the viewer is not on, is
  // administered by its owner alone. A team member scheduling for their own team keeps the
  // original rule, where anyone on the team may administer it.
  const isOwnerAdministered =
    uniqueTeamIds.length > 1 || !isTeamMember(authToken, uniqueTeamIds[0]!)
  const seriesParams = {
    groupId: uniqueTeamIds.length > 1 ? randomUUIDv7() : null,
    ownerUserId: isOwnerAdministered ? viewerId : null,
    templateId
  } as const

  // Every team answers the same questions in an occurrence, so rotate once and share the result.
  // The tie-break is random, so letting each meeting rotate for itself would diverge immediately.
  const questionIds =
    uniqueTeamIds.length > 1
      ? await rotateSeriesTeamHealthQuestionIds(templateId, [], dataLoader)
      : undefined

  // RESOLUTION
  // one row per team that started, holding at most one meeting & at most one series each
  const started: StartForTeamResult[] = []
  for (const teamId of uniqueTeamIds) {
    const team = validTeams.find((t) => t.id === teamId)
    if (!team) continue

    // the viewer facilitates the teams they are on; elsewhere the team's default does, since a
    // facilitator has to be a member of the team whose meeting they run
    let facilitatorId = viewerId
    if (!isTeamMember(authToken, teamId)) {
      const defaultFacilitatorId = await getDefaultTeamFacilitator(teamId, dataLoader)
      if (!defaultFacilitatorId) continue
      facilitatorId = defaultFacilitatorId
    }

    const result = await startTeamHealthForTeam(
      {
        teamId,
        facilitatorId,
        viewerId,
        viewer,
        templateId,
        name,
        rrule,
        seriesParams,
        gcalInput,
        questionIds
      },
      dataLoader
    )
    if (!result) continue

    started.push(result)
  }

  if (started.length === 0) {
    throw new GraphQLError('Meeting already started')
  }
  const startedTeamIds = started.map(({teamId}) => teamId)
  const meetingIds = started.flatMap(({meetingId}) => (meetingId ? [meetingId] : []))
  const seriesIds = started.flatMap(({meetingSeriesId}) =>
    meetingSeriesId ? [meetingSeriesId] : []
  )

  const [firstSeriesId] = seriesIds
  if (firstSeriesId) {
    // one group, one recurrence event, however many teams it covers
    const meetingSeries = await dataLoader.get('meetingSeries').loadNonNull(firstSeriesId)
    analytics.recurrenceStarted(viewer, meetingSeries)
  }

  dataLoader.clearAll('meetingSeries')

  // Publish after all dataLoader work is done: a dataLoader can't be accessed once publish is called
  for (const {teamId, meetingId} of started) {
    publish(
      SubscriptionChannel.TEAM,
      teamId,
      'StartTeamHealthSuccess',
      {meetingIds: meetingId ? [meetingId] : [], teamIds: [teamId]},
      subOptions
    )
  }

  return {meetingIds, teamIds: startedTeamIds}
}

export default startTeamHealth
