import type {TimelineEvent as TimelineEventDB} from '../../../postgres/types'
import type {TimelineEventCompletedActionMeetingResolvers} from '../resolverTypes'

export type TimelineEventCompletedActionMeetingSource = Extract<
  TimelineEventDB,
  {type: 'actionComplete'}
>

const TimelineEventCompletedActionMeeting: TimelineEventCompletedActionMeetingResolvers = {
  meeting: ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  }
}

export default TimelineEventCompletedActionMeeting
