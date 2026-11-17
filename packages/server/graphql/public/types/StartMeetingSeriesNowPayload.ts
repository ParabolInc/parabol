import type {StartMeetingSeriesNowPayloadResolvers} from '../resolverTypes'

export type StartMeetingSeriesNowPayloadSource = {
  meetingId: string | null
  teamId: string
}

const StartMeetingSeriesNowPayload: StartMeetingSeriesNowPayloadResolvers = {
  meeting: ({meetingId}, _args: unknown, {dataLoader}) => {
    return meetingId ? dataLoader.get('newMeetings').loadNonNull(meetingId) : null
  },
  team: ({teamId}, _args: unknown, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default StartMeetingSeriesNowPayload
