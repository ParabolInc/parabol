import type {ReflectPhaseResolvers} from '../resolverTypes'

const ReflectPhase: ReflectPhaseResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'reflect',
  focusedPrompt: ({focusedPromptId}, _args, {dataLoader}) => {
    if (!focusedPromptId) return null
    return dataLoader.get('templatePrompts').loadNonNull(focusedPromptId)
  },

  reflectPrompts: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'retrospective') return []
    return dataLoader.get('templatePromptsByMeetingId').load(meetingId)
  }
}

export default ReflectPhase
