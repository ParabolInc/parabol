import type {ResetReflectionGroupsPayloadResolvers} from '../resolverTypes'

export type ResetReflectionGroupsPayloadSource = {
  meetingId: string
}

const ResetReflectionGroupsPayload: ResetReflectionGroupsPayloadResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'retrospective') throw new Error('Not a retrospective meeting')
    return meeting
  }
}

export default ResetReflectionGroupsPayload
