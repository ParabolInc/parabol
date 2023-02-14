import MeetingTeamPrompt from '../../../database/types/MeetingTeamPrompt'
import {StartTeamPromptSuccessResolvers} from '../resolverTypes'

export type StartTeamPromptSuccessSource = {
  meetingId: string
  teamId: string
}

const StartTeamPromptSuccess: StartTeamPromptSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').load(meetingId) as Promise<MeetingTeamPrompt>
  },
  team: async ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default StartTeamPromptSuccess
