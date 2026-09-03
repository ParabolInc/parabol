import type {RemoveTeamPromptTemplateSuccessResolvers} from '../resolverTypes'

export type RemoveTeamPromptTemplateSuccessSource = {
  templateId: string
  settingsId: string
}

const RemoveTeamPromptTemplateSuccess: RemoveTeamPromptTemplateSuccessResolvers = {
  teamPromptTemplate: ({templateId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingTemplates').loadNonNull(templateId)
  },
  meetingSettings: ({settingsId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingSettings').loadNonNull(settingsId)
  }
}

export default RemoveTeamPromptTemplateSuccess
