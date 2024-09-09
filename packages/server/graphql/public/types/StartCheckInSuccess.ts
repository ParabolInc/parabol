import MeetingAction from '../../../database/types/MeetingAction'
import {StartCheckInSuccessResolvers} from '../resolverTypes'

export type StartCheckInSuccessSource = {
  meetingId: string
  teamId: string
}

const StartCheckInSuccess: StartCheckInSuccessResolvers = {
  meeting: ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').load(meetingId) as Promise<MeetingAction>
  },
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default StartCheckInSuccess
