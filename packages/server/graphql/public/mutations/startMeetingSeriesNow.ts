import {GraphQLError} from 'graphql'
import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {RRuleSet} from 'rrule-rust'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import {getUpcomingRRuleDates} from '../../../utils/getNextRRuleDate'
import startRecurringMeeting from '../../mutations/helpers/startRecurringMeeting'
import type {MutationResolvers} from '../resolverTypes'
import {stopMeetingSeries} from './updateRecurrenceSettings'

const startMeetingSeriesNow: MutationResolvers['startMeetingSeriesNow'] = async (
  _source,
  {meetingSeriesId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // VALIDATION
  const numericId = MeetingSeriesId.split(meetingSeriesId)
  if (!Number.isFinite(numericId)) {
    throw new GraphQLError('Invalid meeting series id')
  }
  const meetingSeries = await dataLoader.get('meetingSeries').load(numericId)
  if (!meetingSeries) {
    throw new GraphQLError('Meeting series not found')
  }
  const {teamId, cancelledAt, recurrenceRule} = meetingSeries
  if (!isTeamMember(authToken, teamId)) {
    throw new GraphQLError('Not on team')
  }
  if (cancelledAt) {
    throw new GraphQLError('Meeting series was cancelled')
  }
  const activeMeetings = await dataLoader.get('activeMeetingsByMeetingSeriesId').load(numericId)
  if (activeMeetings.length > 0) {
    throw new GraphQLError('A meeting in this series is already in progress')
  }

  // RESOLUTION
  // This meeting stands in for the upcoming occurrence, so it runs until the occurrence after that.
  // Ending it on the upcoming occurrence would close it as soon as the schedule caught up.
  const [, occurrenceAfterNext] = getUpcomingRRuleDates(RRuleSet.parse(recurrenceRule), 2)
  const res = await startRecurringMeeting(meetingSeries, dataLoader, subOptions, {
    facilitatorId: viewerId,
    scheduledEndTime: occurrenceAfterNext ?? null
  })
  if ('error' in res) {
    throw new GraphQLError(res.error.message)
  }
  if (!occurrenceAfterNext) {
    // the meeting just started was the last one the rule had to give, so the series is over.
    // Leaving it open would let processRecurrence start the consumed occurrence all over again
    await stopMeetingSeries(meetingSeries)
    dataLoader.clearAll('meetingSeries')
  }
  dataLoader.clearAll('newMeetings')
  return {meetingId: res.meeting.id, teamId}
}

export default startMeetingSeriesNow
