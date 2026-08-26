import {selectNewMeetings} from '../../../postgres/select'
import type {TeamHealthMeetingResolvers} from '../resolverTypes'
import {getTeamHealthEligibleCount} from './helpers/getTeamHealthEligibleCount'

// how far back to walk the series looking for the streak. teams meeting even weekly won't
// realistically run this many cycles in a row, so this is just a sane upper bound on the query
const MAX_STREAK_LOOKBACK = 52

const TeamHealthMeeting: TeamHealthMeetingResolvers = {
  template: async ({templateId}, _args, {dataLoader}) => {
    const template = await dataLoader.get('meetingTemplates').load(templateId)
    return template ?? null
  },
  responses: async ({id: meetingId, endedAt}, _args, {dataLoader}) => {
    // revealing the results is the act of ending the meeting, so endedAt is the only reveal state.
    // Keep raw scores/comments unreadable until then so a small response set can't be
    // polled and de-anonymized
    if (!endedAt) return []
    return dataLoader.get('teamHealthResponsesByMeetingId').load(meetingId)
  },
  respondentCount: async ({id: meetingId}, _args, {dataLoader}) => {
    const responses = await dataLoader.get('teamHealthResponsesByMeetingId').load(meetingId)
    return new Set(responses.map((response) => response.userId)).size
  },
  eligibleCount: async ({id: meetingId, teamId, eligibleCount}, _args, {dataLoader}) => {
    // the stored count is the roster as it stood when the cycle closed; recompute only while the
    // meeting is still open and there is nothing frozen yet
    return eligibleCount ?? getTeamHealthEligibleCount(meetingId, teamId, dataLoader)
  },
  participationRate: async ({id: meetingId, teamId, eligibleCount}, _args, {dataLoader}) => {
    const total = eligibleCount ?? (await getTeamHealthEligibleCount(meetingId, teamId, dataLoader))
    if (total === 0) return null
    const responses = await dataLoader.get('teamHealthResponsesByMeetingId').load(meetingId)
    return new Set(responses.map((response) => response.userId)).size / total
  },
  currentStreak: async ({id: meetingId, meetingSeriesId}, _args, {dataLoader}) => {
    if (!meetingSeriesId) return 0
    const priorMeetings = await selectNewMeetings()
      .where('meetingSeriesId', '=', meetingSeriesId)
      .where('meetingType', '=', 'teamHealth')
      .where('id', '!=', meetingId)
      .where('endedAt', 'is not', null)
      .orderBy('createdAt', 'desc')
      .limit(MAX_STREAK_LOOKBACK)
      .execute()
    if (priorMeetings.length === 0) return 0
    const responsesByMeeting = await Promise.all(
      priorMeetings.map((meeting) =>
        dataLoader.get('teamHealthResponsesByMeetingId').load(meeting.id)
      )
    )
    let streak = 0
    for (const responses of responsesByMeeting) {
      if (responses.length === 0) break
      streak++
    }
    return streak
  }
}

export default TeamHealthMeeting
