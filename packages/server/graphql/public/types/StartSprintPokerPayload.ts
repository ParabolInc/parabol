import type {StartSprintPokerPayloadResolvers} from '../resolverTypes'

export type StartSprintPokerPayloadSource = {
  teamId: string
  meetingId: string
  hasGcalError: boolean
}

const StartSprintPokerPayload: StartSprintPokerPayloadResolvers = {
  meeting: ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  },
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default StartSprintPokerPayload
