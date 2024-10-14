import {ResetReflectionGroupsSuccessResolvers} from '../resolverTypes'

export type ResetReflectionGroupsSuccessSource = {
  meetingId: string
}

const ResetReflectionGroupsSuccess: ResetReflectionGroupsSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'retrospective') throw new Error('Not a retrospective meeting')
    return meeting
  }
}

export default ResetReflectionGroupsSuccess
