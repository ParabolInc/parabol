import {SearchQueryMeetingPropName} from './LocalPokerHandler'

const toSearchQueryId = (
  meetingPropName: SearchQueryMeetingPropName,
  meetingId: string
) => `${meetingPropName}:${meetingId}`

export default toSearchQueryId
