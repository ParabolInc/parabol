import {StartRetrospectiveSuccessResolvers} from '../resolverTypes'

export type StartRetrospectiveSuccessSource = {
  meetingId: string
  teamId: string
  hasGcalError?: boolean
}

const StartRetrospectiveSuccess: StartRetrospectiveSuccessResolvers = {
  meeting: async ({meetingId}, _args: unknown, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'retrospective') throw new Error('Not a retrospective meeting')
    return meeting
  },
  team: ({teamId}, _args: unknown, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default StartRetrospectiveSuccess
