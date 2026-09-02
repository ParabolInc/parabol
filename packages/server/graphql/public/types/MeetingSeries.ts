import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {RRuleSet} from 'rrule-rust'
import {selectNewMeetings} from '../../../postgres/select'
import {isTeamMember} from '../../../utils/authorization'
import {getNextRRuleDate} from '../../../utils/getNextRRuleDate'
import logError from '../../../utils/logError'
import {buildMeetingSeriesSlug} from '../../../utils/meetingSeriesSlug'
import type {MeetingSeriesResolvers} from '../resolverTypes'

const MeetingSeries: MeetingSeriesResolvers = {
  id: ({id}, _args, _context) => {
    return MeetingSeriesId.join(id)
  },
  activeMeetings: async ({id}, _args, {authToken, dataLoader}) => {
    const meetings = await dataLoader.get('activeMeetingsByMeetingSeriesId').load(id)
    // an owner can schedule for a team they are not on, & they cannot join that team's meetings
    return meetings.filter((meeting) => isTeamMember(authToken, meeting.teamId))
  },
  mostRecentMeeting: async ({id: meetingSeriesId}, _args, _context) => {
    const meeting = await selectNewMeetings()
      .where('meetingSeriesId', '=', meetingSeriesId)
      .orderBy('endedAt', 'desc')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .executeTakeFirst()
    return meeting ?? null
  },
  nextMeetingDate: ({id, recurrenceRule, cancelledAt}) => {
    if (cancelledAt) return null
    try {
      return getNextRRuleDate(RRuleSet.parse(recurrenceRule))
    } catch (e) {
      logError(
        e instanceof Error ? e : new Error(`Failed to parse recurrenceRule for meetingSeries ${id}`)
      )
      return null
    }
  },
  urlSlug: ({id, title}) => buildMeetingSeriesSlug(id, title)
}

export default MeetingSeries
