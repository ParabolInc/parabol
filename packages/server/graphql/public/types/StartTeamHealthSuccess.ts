import type {StartTeamHealthSuccessResolvers} from '../resolverTypes'

export type StartTeamHealthSuccessSource = {
  meetingIds: string[]
  teamIds: string[]
}

const StartTeamHealthSuccess: StartTeamHealthSuccessResolvers = {
  meetings: async ({meetingIds}, _args: unknown, {dataLoader}) => {
    const meetings = await dataLoader.get('newMeetings').loadMany(meetingIds)
    return meetings.flatMap((meeting) =>
      meeting && !(meeting instanceof Error) && meeting.meetingType === 'teamHealth'
        ? [meeting]
        : []
    )
  },
  teams: async ({teamIds}, _args: unknown, {dataLoader}) => {
    const teams = await dataLoader.get('teams').loadMany(teamIds)
    return teams.flatMap((team) => (team && !(team instanceof Error) ? [team] : []))
  }
}

export default StartTeamHealthSuccess
