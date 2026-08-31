import type {StartMeetingSeriesNowSuccessResolvers} from '../resolverTypes'

export type StartMeetingSeriesNowSuccessSource = {
  meetingId: string | null
  teamId: string
}

const StartMeetingSeriesNowSuccess: StartMeetingSeriesNowSuccessResolvers = {
  meeting: ({meetingId}, _args: unknown, {dataLoader}) => {
    return meetingId ? dataLoader.get('newMeetings').loadNonNull(meetingId) : null
  },
  team: ({teamId}, _args: unknown, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default StartMeetingSeriesNowSuccess
