import {AutogroupSuccessResolvers} from '../resolverTypes'

export type AutogroupSuccessSource = {
  meetingId: string
}

const AutogroupSuccess: AutogroupSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'retrospective') throw new Error('Not a retrospective meeting')
    return meeting
  }
}

export default AutogroupSuccess
