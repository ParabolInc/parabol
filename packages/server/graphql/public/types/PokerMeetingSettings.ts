import connectionFromTemplateArray from '../../queries/helpers/connectionFromTemplateArray'
import resolveSelectedTemplate from '../../queries/helpers/resolveSelectedTemplate'
import {PokerMeetingSettingsResolvers} from '../resolverTypes'

const PokerMeetingSettings: PokerMeetingSettingsResolvers = {
  __isTypeOf: ({meetingType}) => meetingType === 'poker',
  selectedTemplate: resolveSelectedTemplate<'poker'>('estimatedEffortTemplate'),

  teamTemplates: async ({teamId}, _args, {dataLoader}) => {
    const templates = await dataLoader
      .get('meetingTemplatesByType')
      .load({teamId, meetingType: 'poker'})
    return templates
  },

  organizationTemplates: async ({teamId}, {first, after}, {dataLoader}) => {
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    const {orgId} = team
    const templates = await dataLoader.get('meetingTemplatesByOrgId').load(orgId)
    const organizationTemplates = templates.filter(
      (template) =>
        template.scope !== 'TEAM' && template.teamId !== teamId && template.type === 'poker'
    )
    return connectionFromTemplateArray(organizationTemplates, first, after)
  },

  publicTemplates: async (_src, {first, after}, {dataLoader}) => {
    const publicTemplates = await dataLoader.get('publicTemplatesByType').loadNonNull('poker')
    return connectionFromTemplateArray(publicTemplates, first, after)
  }
}

export default PokerMeetingSettings
