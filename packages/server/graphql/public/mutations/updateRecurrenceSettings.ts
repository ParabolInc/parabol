import dayjs from 'dayjs'
import {sql} from 'kysely'
import {toDateTime} from 'parabol-client/shared/rruleUtil'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {DateTime, RRuleSet} from 'rrule-rust'
import type {DataLoaderInstance} from '../../../dataloader/RootDataLoader'
import getKysely from '../../../postgres/getKysely'
import type {MeetingSeries} from '../../../postgres/types'
import type {MeetingTypeEnum} from '../../../postgres/types/Meeting'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import {getNextRRuleDate} from '../../../utils/getNextRRuleDate'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {updateGcalSeries} from '../../mutations/helpers/createGcalEvent'
import type {MutationResolvers} from '../resolverTypes'

export const createMeetingSeries = async (params: {
  meetingType: MeetingTypeEnum
  title: string
  recurrenceRule: RRuleSet
  teamId: string
  facilitatorId: string
}) => {
  const pg = getKysely()
  const newMeetingSeriesParams = {
    meetingType: params.meetingType,
    title: params.title,
    recurrenceRule: params.recurrenceRule.toString(),
    duration: 0,
    teamId: params.teamId,
    facilitatorId: params.facilitatorId
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
  meetingSeriesName?: string | null
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
    facilitatorId
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

const updateMeetingSeries = async (
  meetingSeries: MeetingSeries,
  newRecurrenceRule: RRuleSet,
  dataLoader: DataLoaderInstance
) => {
  const pg = getKysely()
  const {id: meetingSeriesId} = meetingSeries

  await pg
    .updateTable('MeetingSeries')
    .set({recurrenceRule: newRecurrenceRule.toString()})
    .where('id', '=', meetingSeriesId)
    .where('cancelledAt', 'is', null)
    .execute()
  // lets close all active meetings at the time when
  // a new meeting will be created (tomorrow at 9 AM, same as date start of new recurrence rule)
  const activeMeetings = await dataLoader
    .get('activeMeetingsByMeetingSeriesId')
    .load(meetingSeriesId)
  if (activeMeetings.length > 0) {
    const meetingIds = activeMeetings.map(({id}) => id)
    const scheduledEndTime = getNextRRuleDate(newRecurrenceRule)
    await pg
      .updateTable('NewMeeting')
      .set({scheduledEndTime})
      .where('id', 'in', meetingIds)
      .execute()
  }
}

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

export const updateGCalRecurrenceRule = (
  oldRule: RRuleSet,
  newRule: RRuleSet | null | undefined
) => {
  // null newRule means end the series
  if (newRule) return newRule
  // rrule-rust's setX methods return new instances; mutating in place would silently no-op.
  const {tzid} = oldRule
  const now = DateTime.fromString(toDateTime(dayjs(), tzid))
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

  if (meetingType !== 'teamPrompt' && meetingType !== 'retrospective') {
    return standardError(new Error('Recurring meeting type is not implemented'), {userId: viewerId})
  }

  if (meetingSeriesId) {
    const meetingSeries = await dataLoader.get('meetingSeries').loadNonNull(meetingSeriesId)
    const {gcalSeriesId, teamId, facilitatorId, recurrenceRule} = meetingSeries

    if (!rrule) {
      await stopMeetingSeries(meetingSeries)
      analytics.recurrenceStopped(viewer, meetingSeries)
    } else if (meetingSeries.cancelledAt) {
      // Restart a cancelled series: clear cancelledAt and update recurrenceRule atomically
      await pg
        .updateTable('MeetingSeries')
        .set({cancelledAt: null, recurrenceRule: rrule.toString()})
        .where('id', '=', meetingSeriesId)
        .execute()
      const nextMeetingStartDate = getNextRRuleDate(rrule)
      await pg
        .updateTable('NewMeeting')
        .set({scheduledEndTime: nextMeetingStartDate})
        .where('id', '=', meetingId)
        .execute()
      analytics.recurrenceStarted(viewer, meetingSeries)
    } else {
      await updateMeetingSeries(meetingSeries, rrule, dataLoader)
      analytics.recurrenceStarted(viewer, meetingSeries)
    }
    if (gcalSeriesId) {
      const newRrule = updateGCalRecurrenceRule(RRuleSet.parse(recurrenceRule), rrule)
      await updateGcalSeries({
        gcalSeriesId,
        name: name ?? undefined,
        meetingSeriesId,
        rrule: newRrule,
        teamId,
        userId: facilitatorId,
        dataLoader
      })
    }

    if (name) {
      await pg
        .updateTable('MeetingSeries')
        .set({title: name})
        .where('id', '=', meetingSeries.id)
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
