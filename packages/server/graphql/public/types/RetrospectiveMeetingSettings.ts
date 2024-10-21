import {MeetingTypeEnum} from '../../../postgres/types/Meeting'
import connectionFromTemplateArray from '../../queries/helpers/connectionFromTemplateArray'
import resolveSelectedTemplate from '../../queries/helpers/resolveSelectedTemplate'
import {RetrospectiveMeetingSettingsResolvers} from '../resolverTypes'

const RetrospectiveMeetingSettings: RetrospectiveMeetingSettingsResolvers = {
  __isTypeOf: ({meetingType}) => meetingType === 'retrospective',
  disableAnonymity: ({disableAnonymity}) => disableAnonymity ?? false,
  selectedTemplate: resolveSelectedTemplate('workingStuckTemplate'),

  reflectTemplates: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingTemplatesByType').load({teamId, meetingType: 'retrospective'})
  },
  // We should remove this since it's not longer used
  teamTemplates: async ({teamId}, _args, {dataLoader}) => {
    const templates = await dataLoader
      .get('meetingTemplatesByType')
      .load({teamId, meetingType: 'retrospective' as MeetingTypeEnum})
    return templates
  },
  // We should remove this since it's not longer used
  organizationTemplates: async ({teamId}, {first, after}, {dataLoader}) => {
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    const {orgId} = team
    const templates = await dataLoader.get('meetingTemplatesByOrgId').load(orgId)
    const organizationTemplates = templates.filter(
      (template) =>
        template.scope !== 'TEAM' && template.teamId !== teamId && template.type === 'retrospective'
    )
    return connectionFromTemplateArray(organizationTemplates, first, after)
  },
  // We should remove this since it's not longer used
  publicTemplates: async (_src, {first, after}, {dataLoader}) => {
    const publicTemplates = await dataLoader
      .get('publicTemplatesByType')
      .loadNonNull('retrospective')
    return connectionFromTemplateArray(publicTemplates, first, after)
  }
}

export default RetrospectiveMeetingSettings
