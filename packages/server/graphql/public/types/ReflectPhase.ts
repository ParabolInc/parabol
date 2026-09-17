import getMeetingTemplatePrompts from '../../mutations/helpers/getMeetingTemplatePrompts'
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
    return getMeetingTemplatePrompts(meeting, dataLoader)
  }
}

export default ReflectPhase
