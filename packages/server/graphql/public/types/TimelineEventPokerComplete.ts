import type {TimelineEvent as TimelineEventDB} from '../../../postgres/types'
import type {TimelineEventPokerCompleteResolvers} from '../resolverTypes'

export type TimelineEventPokerCompleteSource = Extract<TimelineEventDB, {type: 'POKER_COMPLETE'}>

const TimelineEventPokerComplete: TimelineEventPokerCompleteResolvers = {
  meeting: ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  }
}

export default TimelineEventPokerComplete
