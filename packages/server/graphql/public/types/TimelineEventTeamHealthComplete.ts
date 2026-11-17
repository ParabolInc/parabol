import type TimelineEventTeamHealthCompleteModel from '../../../database/types/TimelineEventTeamHealthComplete'
import type {TimelineEventTeamHealthCompleteResolvers} from '../resolverTypes'

export type TimelineEventTeamHealthCompleteSource = Pick<
  TimelineEventTeamHealthCompleteModel,
  keyof TimelineEventTeamHealthCompleteModel
>

const TimelineEventTeamHealthComplete: TimelineEventTeamHealthCompleteResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'teamHealth') throw new Error('Invalid meetingId')
    return meeting
  }
}

export default TimelineEventTeamHealthComplete
