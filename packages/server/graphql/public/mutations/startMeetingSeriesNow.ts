import {GraphQLError} from 'graphql'
import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {RRuleSet} from 'rrule-rust'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import {getUpcomingRRuleDates} from '../../../utils/getNextRRuleDate'
import isValid from '../../isValid'
import canAdminMeetingSeries from '../../mutations/helpers/canAdminMeetingSeries'
import rotateSeriesTeamHealthQuestionIds from '../../mutations/helpers/rotateSeriesTeamHealthQuestionIds'
import startRecurringMeeting from '../../mutations/helpers/startRecurringMeeting'
import type {MutationResolvers} from '../resolverTypes'
import {selectGroupSeriesIds, stopMeetingSeriesGroup} from './updateRecurrenceSettings'

const startMeetingSeriesNow: MutationResolvers['startMeetingSeriesNow'] = async (
  _source,
  {meetingSeriesId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  const numericId = MeetingSeriesId.split(meetingSeriesId)
  if (!Number.isFinite(numericId)) {
    throw new GraphQLError('Invalid meeting series id')
  }
  const meetingSeries = await dataLoader.get('meetingSeries').load(numericId)
  if (!meetingSeries) {
    throw new GraphQLError('Meeting series not found')
  }
  const {cancelledAt, recurrenceRule} = meetingSeries
  if (!(await canAdminMeetingSeries(meetingSeries, authToken, dataLoader))) {
    throw new GraphQLError('Only the owner of this meeting series can start it early')
  }
  if (cancelledAt) {
    throw new GraphQLError('Meeting series was cancelled')
  }

  // a group covering several teams opens one meeting per team, on its own sibling series
  const seriesIds = await selectGroupSeriesIds(meetingSeries)
  const groupSeries = (await dataLoader.get('meetingSeries').loadMany(seriesIds))
    .filter(isValid)
    .filter((series) => !series.cancelledAt)

  // A team already mid-occurrence is skipped rather than blocking its siblings, so only a group
  // with nothing left to open is an error. For a single-team series this is the original check.
  const activeMeetingsBySeries = await Promise.all(
    groupSeries.map(async (series) => ({
      series,
      activeMeetings: await dataLoader.get('activeMeetingsByMeetingSeriesId').load(series.id)
    }))
  )
  const startableSeries = activeMeetingsBySeries
    .filter(({activeMeetings}) => activeMeetings.length === 0)
    .map(({series}) => series)
  if (startableSeries.length === 0) {
    throw new GraphQLError('A meeting in this series is already in progress')
  }

  // This meeting stands in for the upcoming occurrence, so it runs until the occurrence after that.
  // Ending it on the upcoming occurrence would close it as soon as the schedule caught up.
  const [, occurrenceAfterNext] = getUpcomingRRuleDates(RRuleSet.parse(recurrenceRule), 2)
  // Only a group opening several teams at once needs to rotate here; a lone series lets its
  // own meeting rotate, against its own history
  const questionIds =
    meetingSeries.groupId && meetingSeries.meetingType === 'teamHealth' && meetingSeries.templateId
      ? await rotateSeriesTeamHealthQuestionIds(meetingSeries.templateId, seriesIds, dataLoader)
      : undefined

  const startedMeetings = (
    await Promise.all(
      startableSeries.map(async (series) => {
        const res = await startRecurringMeeting(series, dataLoader, subOptions, {
          // whoever kicks off an occurrence early facilitates it, but only on teams they are on.
          // An owner may not be on every team the group covers
          facilitatorId: isTeamMember(authToken, series.teamId) ? viewerId : undefined,
          scheduledEndTime: occurrenceAfterNext ?? null,
          questionIds
        })
        return 'error' in res ? null : res.meeting
      })
    )
  ).filter(isValid)
  if (startedMeetings.length === 0) {
    throw new GraphQLError('Unable to start a meeting for any team in this series group')
  }

  if (!occurrenceAfterNext) {
    // the meeting just started was the last one the rule had to give, so the series is over.
    // it stays open until its scheduledEndTime, which processRecurrence honors
    await stopMeetingSeriesGroup(meetingSeries)
    dataLoader.clearAll('meetingSeries')
  }
  dataLoader.clearAll('newMeetings')

  // the viewer can only join a meeting on a team they are on, & an owner may be on none of them
  const joinableMeeting = startedMeetings.find(({teamId}) => isTeamMember(authToken, teamId))
  return {
    meetingId: joinableMeeting?.id ?? null,
    // the team whose dash the client refreshes, so it has to be the one the meeting is on. Other
    // teams in the group refresh from their own StartTeamHealthSuccess subscription
    teamId: joinableMeeting?.teamId ?? meetingSeries.teamId
  }
}

export default startMeetingSeriesNow
