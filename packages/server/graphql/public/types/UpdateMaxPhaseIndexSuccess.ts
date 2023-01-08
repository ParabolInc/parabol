import {UpdateMaxPhaseIndexSuccessResolvers} from '../resolverTypes'

export type UpdateMaxPhaseIndexSuccessSource = {
  meetingId: string
}

const UpdateMaxPhaseIndexSuccess: UpdateMaxPhaseIndexSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = (await dataLoader.get('newMeetings').load(meetingId)) as any
    return meeting
  }
}

export default UpdateMaxPhaseIndexSuccess
