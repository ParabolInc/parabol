import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {RRuleSet} from 'rrule-rust'
import {selectNewMeetings} from '../../../postgres/select'
import {isTeamMember} from '../../../utils/authorization'
import {getNextRRuleDate} from '../../../utils/getNextRRuleDate'
import logError from '../../../utils/logError'
import {buildMeetingSeriesSlug} from '../../../utils/meetingSeriesSlug'
import canReadMeetingSeries from '../../mutations/helpers/canReadMeetingSeries'
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
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  },
  owner: async ({ownerUserId}, _args, {dataLoader}) => {
    if (!ownerUserId) return null
    return (await dataLoader.get('users').load(ownerUserId)) ?? null
  },
  groupSeries: async ({id, groupId}, _args, {authToken, dataLoader}) => {
    if (!groupId) return []
    const siblings = await dataLoader.get('meetingSeriesByGroupId').load(groupId)
    return siblings.filter((series) => series.id !== id && canReadMeetingSeries(series, authToken))
  },
  mostRecentMeeting: async ({id: meetingSeriesId, teamId}, _args, {authToken}) => {
    // an owner can schedule for a team they are not on, & they cannot join that team's meetings
    if (!isTeamMember(authToken, teamId)) return null
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
