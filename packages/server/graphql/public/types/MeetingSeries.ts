import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {RRuleSet} from 'rrule-rust'
import {selectNewMeetings} from '../../../postgres/select'
import {getNextRRuleDate} from '../../../utils/getNextRRuleDate'
import logError from '../../../utils/logError'
import {buildMeetingSeriesSlug} from '../../../utils/meetingSeriesSlug'
import type {MeetingSeriesResolvers} from '../resolverTypes'

const MeetingSeries: MeetingSeriesResolvers = {
  id: ({id}, _args, _context) => {
    return MeetingSeriesId.join(id)
  },
  activeMeetings: async (meetingSeries, _args, {dataLoader}) => {
    const res = await dataLoader.get('activeMeetingsByMeetingSeriesId').load(meetingSeries.id)
    return res || []
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
