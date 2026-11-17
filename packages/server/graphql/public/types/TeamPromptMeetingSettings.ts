import resolveSelectedTemplate from '../../queries/helpers/resolveSelectedTemplate'
import promptTemplateRules from '../mutations/helpers/promptTemplateRules'
import type {TeamPromptMeetingSettingsResolvers} from '../resolverTypes'

const TeamPromptMeetingSettings: TeamPromptMeetingSettingsResolvers = {
  __isTypeOf: ({meetingType}) => meetingType === 'teamPrompt',
  selectedTemplate: resolveSelectedTemplate(promptTemplateRules.teamPrompt.defaultTemplateId),
  teamTemplates: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingTemplatesByType').load({teamId, meetingType: 'teamPrompt'})
  }
}

export default TeamPromptMeetingSettings
