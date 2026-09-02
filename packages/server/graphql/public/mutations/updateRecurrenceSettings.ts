import dayjs from 'dayjs'
import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {DateTime, RRuleSet} from 'rrule-rust'
import getKysely from '../../../postgres/getKysely'
import type {MeetingSeries} from '../../../postgres/types'
import type {MeetingTypeEnum} from '../../../postgres/types/Meeting'
import {type AnalyticsUser, analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import {getNextRRuleDate} from '../../../utils/getNextRRuleDate'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'
import canAdminMeetingSeries from '../../mutations/helpers/canAdminMeetingSeries'
import {updateGcalSeries} from '../../mutations/helpers/createGcalEvent'
import type {MutationResolvers} from '../resolverTypes'

export const createMeetingSeries = async (params: {
  meetingType: MeetingTypeEnum
  title: string
  recurrenceRule: RRuleSet
  teamId: string
  facilitatorId: string
  // shared by the sibling series of a group that covers several teams
  groupId?: string | null
  // when set, only this user may administer the series. See canAdminMeetingSeries
  ownerUserId?: string | null
  templateId?: string | null
}) => {
  const pg = getKysely()
  const newMeetingSeriesParams = {
    meetingType: params.meetingType,
    title: params.title,
    recurrenceRule: params.recurrenceRule.toString(),
    duration: 0,
    teamId: params.teamId,
    facilitatorId: params.facilitatorId,
    groupId: params.groupId ?? null,
    ownerUserId: params.ownerUserId ?? null,
    templateId: params.templateId ?? null
  } as const
  const newMeetingSeries = await pg
    .insertInto('MeetingSeries')
    .values(newMeetingSeriesParams)
    .returning('id')
    .executeTakeFirstOrThrow()
  return {
    id: newMeetingSeries.id,
    ...newMeetingSeriesParams
  }
}

export const startNewMeetingSeries = async (
  meeting: {
    id: string
    teamId: string
    meetingType: MeetingTypeEnum
    name: string
    facilitatorUserId: string | null
  },
  recurrenceRule: RRuleSet,
  meetingSeriesName?: string | null,
  seriesParams?: {groupId?: string | null; ownerUserId?: string | null; templateId?: string | null}
) => {
  const {
    id: meetingId,
    teamId,
    meetingType,
    name: meetingName,
    facilitatorUserId: facilitatorId
  } = meeting
  if (!facilitatorId) {
    throw new Error('No facilitatorId')
  }
  const newMeetingSeries = await createMeetingSeries({
    meetingType,
    title: meetingSeriesName || meetingName.split('-')[0]!.trim(),
    recurrenceRule,
    teamId,
    facilitatorId,
    ...seriesParams
  })
  const nextMeetingStartDate = getNextRRuleDate(recurrenceRule)
  await getKysely()
    .updateTable('NewMeeting')
    .set({
      meetingSeriesId: newMeetingSeries.id,
      scheduledEndTime: nextMeetingStartDate
    })
    .where('id', '=', meetingId)
    .execute()
  return newMeetingSeries
}

/**
 * The sibling series of a group that covers several teams. They share a title, a recurrence
 * rule & a lifecycle, so a write to any of those fans out over the whole group. A series with no
 * groupId is a group of one.
 */
export const selectGroupSeriesIds = async (
  meetingSeries: Pick<MeetingSeries, 'id' | 'groupId'>
) => {
  const {id, groupId} = meetingSeries
  if (!groupId) return [id]
  const rows = await getKysely()
    .selectFrom('MeetingSeries')
    .select('id')
    .where('groupId', '=', groupId)
    .execute()
  return rows.map((row) => row.id)
}

/**
 * Cancels the whole group: this series and every sibling sharing its groupId. Use when the
 * group itself is over — its owner ended it, or the rule ran out of occurrences.
 */
export const stopMeetingSeriesGroup = async (meetingSeries: MeetingSeries) => {
  const pg = getKysely()
  const meetingSeriesIds = await selectGroupSeriesIds(meetingSeries)
  await pg
    .with('NewMeetingUpdateEnd', (qb) =>
      qb
        .updateTable('NewMeeting')
        .set({scheduledEndTime: null})
        .where('meetingSeriesId', 'in', meetingSeriesIds)
        .where('endedAt', 'is', null)
    )
    .updateTable('MeetingSeries')
    .set({cancelledAt: sql`CURRENT_TIMESTAMP`})
    .where('id', 'in', meetingSeriesIds)
    .execute()
}

/**
 * Cancels one team's series and nothing else, so a group covering others keeps recurring for
 * them. Use when this team alone drops out, e.g. it was archived or lost its facilitator.
 */
export const stopMeetingSeries = async (meetingSeries: MeetingSeries) => {
  const pg = getKysely()
  await pg
    .with('NewMeetingUpdateEnd', (qb) =>
      qb
        .updateTable('NewMeeting')
        .set({scheduledEndTime: null})
        .where('meetingSeriesId', '=', meetingSeries.id)
        .where('endedAt', 'is', null)
    )
    .updateTable('MeetingSeries')
    .set({cancelledAt: sql`CURRENT_TIMESTAMP`})
    .where('id', '=', meetingSeries.id)
    .execute()
}

/**
 * Applies a recurrence rule and/or a title to a series and every sibling in its group, keeping the
 * calendar invite in step. This is the one implementation: updateRecurrenceSettings addresses it by
 * meeting, updateMeetingSeries by series id, and both must behave identically once resolved.
 *
 * Returns the group's series ids, and whether anything changed — cancelling an already-cancelled
 * series is a no-op rather than a second cancellation.
 */
export const applySeriesRecurrence = async (
  meetingSeries: MeetingSeries,
  {rrule, name}: {rrule: RRuleSet | null; name?: string | null},
  viewer: AnalyticsUser,
  dataLoader: DataLoaderWorker
) => {
  const pg = getKysely()
  const {recurrenceRule, cancelledAt} = meetingSeries
  // a group covering several teams edits every sibling series at once
  const seriesIds = await selectGroupSeriesIds(meetingSeries)
  // Read the siblings before the writes: each team has its own calendar event, and the calendar
  // update needs the recurrence rule as it was before this change.
  const groupSeries = (await dataLoader.get('meetingSeries').loadMany(seriesIds)).filter(isValid)

  if (!rrule && cancelledAt) return {seriesIds, changed: false}

  if (!rrule) {
    await stopMeetingSeriesGroup(meetingSeries)
    analytics.recurrenceStopped(viewer, meetingSeries)
  } else if (cancelledAt) {
    // Restart a cancelled series: clear cancelledAt and update recurrenceRule atomically
    await pg
      .updateTable('MeetingSeries')
      .set({cancelledAt: null, recurrenceRule: rrule.toString()})
      .where('id', 'in', seriesIds)
      .execute()
    analytics.recurrenceStarted(viewer, meetingSeries)
  } else {
    await pg
      .updateTable('MeetingSeries')
      .set({recurrenceRule: rrule.toString()})
      .where('id', 'in', seriesIds)
      .where('cancelledAt', 'is', null)
      .execute()
    // close every active meeting when the next one is due, so the schedule never overlaps itself
    const activeMeetingsBySeries = await dataLoader
      .get('activeMeetingsByMeetingSeriesId')
      .loadMany(seriesIds)
    const activeMeetings = activeMeetingsBySeries.filter(isValid).flat()
    if (activeMeetings.length > 0) {
      await pg
        .updateTable('NewMeeting')
        .set({scheduledEndTime: getNextRRuleDate(rrule)})
        .where(
          'id',
          'in',
          activeMeetings.map(({id}) => id)
        )
        .execute()
    }
    analytics.recurrenceStarted(viewer, meetingSeries)
  }

  if (name) {
    await pg.updateTable('MeetingSeries').set({title: name}).where('id', 'in', seriesIds).execute()
  }

  // every team on the group has its own invite, so a group edit has to reach all of them
  const newRrule = updateGCalRecurrenceRule(RRuleSet.parse(recurrenceRule), rrule)
  await Promise.all(
    groupSeries.map(async (series) => {
      if (!series.gcalSeriesId) return
      await updateGcalSeries({
        gcalSeriesId: series.gcalSeriesId,
        name: name ?? undefined,
        meetingSeriesId: series.id,
        rrule: newRrule,
        teamId: series.teamId,
        userId: series.ownerUserId ?? series.facilitatorId,
        dataLoader
      })
    })
  )
  return {seriesIds, changed: true}
}

export const updateGCalRecurrenceRule = (
  oldRule: RRuleSet,
  newRule: RRuleSet | null | undefined
) => {
  // null newRule means end the series
  if (newRule) return newRule
  // rrule-rust's setX methods return new instances; mutating in place would silently no-op.
  // UNTIL must be UTC (Z suffix) — Google rejects local-time UNTIL with 400 "Invalid recurrence rule".
  const now = DateTime.fromString(dayjs().utc().format('YYYYMMDD[T]HHmmss[Z]'))
  const updatedRrules = oldRule.rrules.map((rrule) => rrule.setUntil(now))
  return oldRule.setRrules(updatedRrules)
}

const updateRecurrenceSettings: MutationResolvers['updateRecurrenceSettings'] = async (
  _source,
  {meetingId, name, rrule: rruleString},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const rrule = rruleString ? RRuleSet.parse(rruleString) : null

  // VALIDATION
  const [meeting, viewer] = await Promise.all([
    dataLoader.get('newMeetings').load(meetingId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
  if (!meeting) {
    return standardError(new Error('Meeting not found'), {
      userId: viewerId
    })
  }
  const {teamId, meetingType, meetingSeriesId} = meeting

  if (
    meetingType !== 'teamPrompt' &&
    meetingType !== 'retrospective' &&
    meetingType !== 'teamHealth'
  ) {
    return standardError(new Error('Recurring meeting type is not implemented'), {userId: viewerId})
  }

  if (meetingSeriesId) {
    const meetingSeries = await dataLoader.get('meetingSeries').loadNonNull(meetingSeriesId)
    if (!(await canAdminMeetingSeries(meetingSeries, authToken, dataLoader))) {
      return standardError(new Error('Only the owner of this meeting series can change it'), {
        userId: viewerId
      })
    }
    const wasCancelled = !!meetingSeries.cancelledAt
    await applySeriesRecurrence(meetingSeries, {rrule, name}, viewer, dataLoader)
    if (rrule && wasCancelled) {
      // this meeting is the one being restarted, so it closes when the revived rule next fires
      await pg
        .updateTable('NewMeeting')
        .set({scheduledEndTime: getNextRRuleDate(rrule)})
        .where('id', '=', meetingId)
        .execute()
    }
  } else {
    if (!rrule) {
      return standardError(
        new Error('When meeting is not recurring, recurrence rule has to be provided'),
        {userId: viewerId}
      )
    }

    const newMeetingSeries = await startNewMeetingSeries(meeting, rrule, name)
    analytics.recurrenceStarted(viewer, newMeetingSeries)
  }

  dataLoader.clearAll(['newMeetings', 'meetingSeries'])

  // RESOLUTION
  const data = {meetingId}
  publish(SubscriptionChannel.TEAM, teamId, 'UpdateRecurrenceSettingsSuccess', data, subOptions)
  return data
}

export default updateRecurrenceSettings
