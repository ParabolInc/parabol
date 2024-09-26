import {GenerateGroupsSuccessResolvers} from '../resolverTypes'

export type GenerateGroupsSuccessSource = {
  meetingId: string
}

const GenerateGroupsSuccess: GenerateGroupsSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'retrospective')
      throw new Error('Meeting type is not retrospective')
    return meeting
  }
}

export default GenerateGroupsSuccess
