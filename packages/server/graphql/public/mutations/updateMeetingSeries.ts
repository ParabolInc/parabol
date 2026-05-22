import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {RRuleSet} from 'rrule-rust'
import getKysely from '../../../postgres/getKysely'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import {getNextRRuleDate} from '../../../utils/getNextRRuleDate'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {updateGcalSeries} from '../../mutations/helpers/createGcalEvent'
import type {MutationResolvers} from '../resolverTypes'
import {stopMeetingSeries, updateGCalRecurrenceRule} from './updateRecurrenceSettings'

const updateMeetingSeries: MutationResolvers['updateMeetingSeries'] = async (
  _source,
  {meetingSeriesId, name, rrule: rruleString},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const rrule = rruleString ? RRuleSet.parse(rruleString) : null

  const numericId = MeetingSeriesId.split(meetingSeriesId)
  if (!Number.isFinite(numericId)) {
    return standardError(new Error('Invalid meeting series id'), {userId: viewerId})
  }
  const [meetingSeries, viewer] = await Promise.all([
    dataLoader.get('meetingSeries').load(numericId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
  if (!meetingSeries) {
    return standardError(new Error('Meeting series not found'), {userId: viewerId})
  }
  const {teamId, gcalSeriesId, facilitatorId, recurrenceRule, cancelledAt} = meetingSeries
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Not on team'), {userId: viewerId})
  }

  if (!rrule) {
    if (cancelledAt) {
      return {meetingSeriesId: numericId}
    }
    await stopMeetingSeries(meetingSeries)
    analytics.recurrenceStopped(viewer, meetingSeries)
  } else if (cancelledAt) {
    await pg
      .updateTable('MeetingSeries')
      .set({
        cancelledAt: null,
        recurrenceRule: rrule.toString(),
        ...(name ? {title: name} : null)
      })
      .where('id', '=', numericId)
      .execute()
    analytics.recurrenceStarted(viewer, meetingSeries)
  } else {
    await pg
      .updateTable('MeetingSeries')
      .set({
        recurrenceRule: rrule.toString(),
        ...(name ? {title: name} : null)
      })
      .where('id', '=', numericId)
      .where('cancelledAt', 'is', null)
      .execute()
    const activeMeetings = await dataLoader
      .get('activeMeetingsByMeetingSeriesId')
      .load(numericId)
    if (activeMeetings.length > 0) {
      const nextMeetingStartDate = getNextRRuleDate(rrule)
      await pg
        .updateTable('NewMeeting')
        .set({scheduledEndTime: nextMeetingStartDate})
        .where(
          'id',
          'in',
          activeMeetings.map(({id}) => id)
        )
        .execute()
    }
    analytics.recurrenceStarted(viewer, meetingSeries)
  }

  if (gcalSeriesId) {
    const newRrule = updateGCalRecurrenceRule(RRuleSet.parse(recurrenceRule), rrule)
    await updateGcalSeries({
      gcalSeriesId,
      name: name ?? undefined,
      meetingSeriesId: numericId,
      rrule: newRrule,
      teamId,
      userId: facilitatorId,
      dataLoader
    })
  }

  dataLoader.clearAll(['meetingSeries', 'newMeetings'])

  const data = {meetingSeriesId: numericId}
  publish(SubscriptionChannel.TEAM, teamId, 'UpdateMeetingSeriesSuccess', data, subOptions)
  return data
}

export default updateMeetingSeries
