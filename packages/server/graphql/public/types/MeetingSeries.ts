import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {RRuleSet} from 'rrule-rust'
import {selectNewMeetings} from '../../../postgres/select'
import {isTeamMember} from '../../../utils/authorization'
import {getNextRRuleDate} from '../../../utils/getNextRRuleDate'
import logError from '../../../utils/logError'
import {buildMeetingSeriesSlug} from '../../../utils/meetingSeriesSlug'
import isValid from '../../isValid'
import type {MeetingSeriesResolvers} from '../resolverTypes'

const MeetingSeries: MeetingSeriesResolvers = {
  id: ({id}, _args, _context) => {
    return MeetingSeriesId.join(id)
  },
  activeMeetings: async ({id, groupId}, _args, {authToken, dataLoader}) => {
    // A group covering several teams runs one meeting per team, each on its own sibling series.
    // An invitee-facing link names only one of them, so gather the group & scope to the viewer.
    const seriesIds = groupId
      ? (await dataLoader.get('meetingSeriesByGroupId').load(groupId)).map((series) => series.id)
      : [id]
    const meetingsBySeries = await dataLoader
      .get('activeMeetingsByMeetingSeriesId')
      .loadMany(seriesIds)
    return meetingsBySeries
      .filter(isValid)
      .flat()
      .filter((meeting) => isTeamMember(authToken, meeting.teamId))
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
