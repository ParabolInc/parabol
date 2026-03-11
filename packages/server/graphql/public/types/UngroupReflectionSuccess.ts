import type {UngroupReflectionSuccessResolvers} from '../resolverTypes'

export type UngroupReflectionSuccessSource = {
  meetingId: string
}

const UngroupReflectionSuccess: UngroupReflectionSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'retrospective') throw new Error('Not a retrospective meeting')
    return meeting
  }
}

export default UngroupReflectionSuccess
