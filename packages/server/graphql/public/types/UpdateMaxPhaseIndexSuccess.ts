import MeetingRetrospective from '../../../database/types/MeetingRetrospective'
import {UpdateMaxPhaseIndexSuccessResolvers} from '../resolverTypes'

export type UpdateMaxPhaseIndexSuccessSource = {
  maxPhaseIndex: number
  meetingId: string
  currentPhaseIndex: number
}

const UpdateMaxPhaseIndexSuccess: UpdateMaxPhaseIndexSuccessResolvers = {
  maxPhaseIndex: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    return ((await meeting) as MeetingRetrospective).maxPhaseIndex
  }
}

export default UpdateMaxPhaseIndexSuccess
