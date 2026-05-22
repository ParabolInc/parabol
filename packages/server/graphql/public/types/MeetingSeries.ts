import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {RRuleSet} from 'rrule-rust'
import {selectNewMeetings} from '../../../postgres/select'
import {getNextRRuleDate} from '../../../utils/getNextRRuleDate'
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
  nextMeetingDate: ({recurrenceRule, cancelledAt}) => {
    if (cancelledAt) return null
    return getNextRRuleDate(RRuleSet.parse(recurrenceRule))
  }
}

export default MeetingSeries
