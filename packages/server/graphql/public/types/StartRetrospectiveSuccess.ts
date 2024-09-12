import {RetrospectiveMeeting} from '../../../postgres/types/Meeting'
import {StartRetrospectiveSuccessResolvers} from '../resolverTypes'

export type StartRetrospectiveSuccessSource = {
  meetingId: string
  teamId: string
  hasGcalError?: boolean
}

const StartRetrospectiveSuccess: StartRetrospectiveSuccessResolvers = {
  meeting: ({meetingId}, _args: unknown, {dataLoader}) => {
    return dataLoader.get('newMeetings').load(meetingId) as Promise<RetrospectiveMeeting>
  },
  team: ({teamId}, _args: unknown, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default StartRetrospectiveSuccess
