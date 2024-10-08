import dayjs from 'dayjs'
import {sql} from 'kysely'
import {toDateTime} from 'parabol-client/shared/rruleUtil'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {DateTime, RRuleSet} from 'rrule-rust'
import {DataLoaderInstance} from '../../../dataloader/RootDataLoader'
import getKysely from '../../../postgres/getKysely'
import {insertMeetingSeries as insertMeetingSeriesQuery} from '../../../postgres/queries/insertMeetingSeries'
import restartMeetingSeries from '../../../postgres/queries/restartMeetingSeries'
import {MeetingTypeEnum} from '../../../postgres/types/Meeting'
import {MeetingSeries} from '../../../postgres/types/MeetingSeries'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import {getNextRRuleDate} from '../../../utils/getNextRRuleDate'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {updateGcalSeries} from '../../mutations/helpers/createGcalEvent'
import {MutationResolvers} from '../resolverTypes'

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
  const pg = getKysely()
  if (!facilitatorId) {
    throw new Error('No facilitatorId')
  }
  const newMeetingSeriesParams = {
    meetingType,
    title: meetingSeriesName || meetingName.split('-')[0]!.trim(), // if no name is provided, we use the name of the first meeting without the date
    recurrenceRule: recurrenceRule.toString(),
    // TODO: once we have to UI ready, we should set and handle it properly, for now meeting will last till the new meeting starts
    duration: 0,
    teamId,
    facilitatorId
  } as const
  const newMeetingSeriesId = await insertMeetingSeriesQuery(newMeetingSeriesParams)
  const nextMeetingStartDate = getNextRRuleDate(recurrenceRule)

  await pg
    .updateTable('NewMeeting')
    .set({meetingSeriesId: newMeetingSeriesId, scheduledEndTime: nextMeetingStartDate})
    .where('id', '=', meetingId)
    .execute()
  return {
    id: newMeetingSeriesId,
    ...newMeetingSeriesParams
  }
}

const updateMeetingSeries = async (
  meetingSeries: MeetingSeries,
  newRecurrenceRule: RRuleSet,
  dataLoader: DataLoaderInstance
) => {
  const pg = getKysely()
  const {id: meetingSeriesId} = meetingSeries

  await restartMeetingSeries(meetingSeriesId, {recurrenceRule: newRecurrenceRule.toString()})

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

const updateGCalRecurrenceRule = (oldRule: RRuleSet, newRule: RRuleSet | null | undefined) => {
  // null newRule means end the series
  if (newRule) return newRule
  const {tzid} = oldRule
  const now = DateTime.fromString(toDateTime(dayjs(), tzid))
  oldRule.rrules.forEach((rrule) => rrule.setUntil(now))
  return oldRule
}

const updateRecurrenceSettings: MutationResolvers['updateRecurrenceSettings'] = async (
  _source,
  {meetingId, name, rrule},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // VALIDATION
  const [meeting, viewer] = await Promise.all([
    dataLoader.get('newMeetings').load(meetingId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
  if (!meeting) {
    return standardError(new Error('Meeting not found'), {userId: viewerId})
  }
  const {teamId, meetingType, meetingSeriesId} = meeting
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  if (meetingType !== 'teamPrompt' && meetingType !== 'retrospective') {
    return standardError(new Error('Recurring meeting type is not implemented'), {userId: viewerId})
  }

  if (meetingSeriesId) {
    const meetingSeries = await dataLoader.get('meetingSeries').loadNonNull(meetingSeriesId)
    const {gcalSeriesId, teamId, facilitatorId, recurrenceRule} = meetingSeries

    if (!rrule) {
      await stopMeetingSeries(meetingSeries)
      analytics.recurrenceStopped(viewer, meetingSeries)
    } else {
      await updateMeetingSeries(meetingSeries, rrule, dataLoader)
      analytics.recurrenceStarted(viewer, meetingSeries)
    }
    if (gcalSeriesId) {
      const newRrule = updateGCalRecurrenceRule(RRuleSet.parse(recurrenceRule), rrule)
      await updateGcalSeries({
        gcalSeriesId,
        name: name ?? undefined,
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
