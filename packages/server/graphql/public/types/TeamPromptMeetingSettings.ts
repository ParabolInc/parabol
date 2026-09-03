import resolveSelectedTemplate from '../../queries/helpers/resolveSelectedTemplate'
import type {TeamPromptMeetingSettingsResolvers} from '../resolverTypes'

const TeamPromptMeetingSettings: TeamPromptMeetingSettingsResolvers = {
  __isTypeOf: ({meetingType}) => meetingType === 'teamPrompt',
  selectedTemplate: resolveSelectedTemplate('teamPrompt'),
  teamPromptTemplates: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingTemplatesByType').load({teamId, meetingType: 'teamPrompt'})
  }
}

export default TeamPromptMeetingSettings
