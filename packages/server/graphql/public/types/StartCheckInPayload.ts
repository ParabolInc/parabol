import type {StartCheckInPayloadResolvers} from '../resolverTypes'

export type StartCheckInPayloadSource = {
  meetingId: string
  teamId: string
}

const StartCheckInPayload: StartCheckInPayloadResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'action') throw new Error('Not a check-in meeting')
    return meeting
  },
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default StartCheckInPayload
