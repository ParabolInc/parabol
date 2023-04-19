import TimelineEventTeamPromptCompleteModel from '../../../database/types/TimelineEventTeamPromptComplete'
import {TimelineEventTeamPromptCompleteResolvers} from '../resolverTypes'
import {timelineEventInterfaceResolvers} from './TimelineEvent'

export type TimelineEventTeamPromptCompleteSource = Pick<
  TimelineEventTeamPromptCompleteModel,
  keyof TimelineEventTeamPromptCompleteModel
>

const TimelineEventTeamPromptComplete: TimelineEventTeamPromptCompleteResolvers = {
  ...timelineEventInterfaceResolvers(),
  __isTypeOf: ({type}) => type === 'TEAM_PROMPT_COMPLETE',
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (meeting.meetingType !== 'teamPrompt') throw new Error('Invalid meetingId')
    return meeting
  },
  team: ({teamId}, _args: unknown, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default TimelineEventTeamPromptComplete
