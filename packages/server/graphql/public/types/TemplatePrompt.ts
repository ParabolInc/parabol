import type {TemplatePromptResolvers} from '../resolverTypes'

const TemplatePrompt: TemplatePromptResolvers = {
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  },

  template: ({templateId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingTemplates').loadNonNull(templateId)
  }
}

export default TemplatePrompt
