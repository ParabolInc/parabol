import type {StartSprintPokerSuccessResolvers} from '../resolverTypes'

export type StartSprintPokerSuccessSource = {
  teamId: string
  meetingId: string
  hasGcalError: boolean
}

const StartSprintPokerSuccess: StartSprintPokerSuccessResolvers = {
  meeting: ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  },
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default StartSprintPokerSuccess
