import type {GenerateGroupsPayloadResolvers} from '../resolverTypes'

export type GenerateGroupsPayloadSource = {
  meetingId: string
}

const GenerateGroupsPayload: GenerateGroupsPayloadResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'retrospective')
      throw new Error('Meeting type is not retrospective')
    return meeting
  }
}

export default GenerateGroupsPayload
