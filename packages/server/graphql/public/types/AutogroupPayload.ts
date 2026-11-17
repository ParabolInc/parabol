import type {AutogroupPayloadResolvers} from '../resolverTypes'

export type AutogroupPayloadSource = {
  meetingId: string
}

const AutogroupPayload: AutogroupPayloadResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'retrospective') throw new Error('Not a retrospective meeting')
    return meeting
  }
}

export default AutogroupPayload
