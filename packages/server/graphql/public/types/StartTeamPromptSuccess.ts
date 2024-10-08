import {StartTeamPromptSuccessResolvers} from '../resolverTypes'

export type StartTeamPromptSuccessSource = {
  meetingId: string
  teamId: string
}

const StartTeamPromptSuccess: StartTeamPromptSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'teamPrompt') throw new Error('Not a team prompt meeting')
    return meeting
  },
  team: async ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default StartTeamPromptSuccess
