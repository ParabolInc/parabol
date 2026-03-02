import type TimelineEventTeamPromptCompleteModel from '../../../database/types/TimelineEventTeamPromptComplete'
import type {TimelineEventTeamPromptCompleteResolvers} from '../resolverTypes'

export type TimelineEventTeamPromptCompleteSource = Pick<
  TimelineEventTeamPromptCompleteModel,
  keyof TimelineEventTeamPromptCompleteModel
>

const TimelineEventTeamPromptComplete: TimelineEventTeamPromptCompleteResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'teamPrompt') throw new Error('Invalid meetingId')
    return meeting
  }
}

export default TimelineEventTeamPromptComplete
