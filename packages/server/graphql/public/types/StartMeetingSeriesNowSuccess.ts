import type {StartMeetingSeriesNowSuccessResolvers} from '../resolverTypes'

export type StartMeetingSeriesNowSuccessSource = {
  meetingId: string
  teamId: string
}

const StartMeetingSeriesNowSuccess: StartMeetingSeriesNowSuccessResolvers = {
  meeting: ({meetingId}, _args: unknown, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  },
  team: ({teamId}, _args: unknown, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default StartMeetingSeriesNowSuccess
