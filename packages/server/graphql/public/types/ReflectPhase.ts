import {ReflectPhaseResolvers} from '../resolverTypes'

const ReflectPhase: ReflectPhaseResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'reflect',
  focusedPrompt: ({focusedPromptId}, _args, {dataLoader}) => {
    if (!focusedPromptId) return null
    return dataLoader.get('reflectPrompts').loadNonNull(focusedPromptId)
  },

  reflectPrompts: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'retrospective') return []
    const prompts = await dataLoader.get('reflectPromptsByTemplateId').load(meeting.templateId)
    // only show prompts that were created before the meeting and
    // either have not been removed or they were removed after the meeting was created
    return prompts.filter(
      (prompt) =>
        prompt.createdAt < meeting.createdAt &&
        (!prompt.removedAt || meeting.createdAt < prompt.removedAt)
    )
  }
}

export default ReflectPhase
