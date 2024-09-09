import MeetingRetrospective from '../../../database/types/MeetingRetrospective'
import {StartRetrospectiveSuccessResolvers} from '../resolverTypes'

export type StartRetrospectiveSuccessSource = {
  meetingId: string
  teamId: string
  hasGcalError?: boolean
}

const StartRetrospectiveSuccess: StartRetrospectiveSuccessResolvers = {
  meeting: ({meetingId}, _args: unknown, {dataLoader}) => {
    return dataLoader.get('newMeetings').load(meetingId) as Promise<MeetingRetrospective>
  },
  team: ({teamId}, _args: unknown, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default StartRetrospectiveSuccess
