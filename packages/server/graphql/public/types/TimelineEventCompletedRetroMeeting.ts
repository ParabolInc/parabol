import type {TimelineEvent as TimelineEventDB} from '../../../postgres/types'
import type {TimelineEventCompletedRetroMeetingResolvers} from '../resolverTypes'

export type TimelineEventCompletedRetroMeetingSource = Extract<
  TimelineEventDB,
  {type: 'retroComplete'}
>

const TimelineEventCompletedRetroMeeting: TimelineEventCompletedRetroMeetingResolvers = {
  meeting: ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  }
}

export default TimelineEventCompletedRetroMeeting
