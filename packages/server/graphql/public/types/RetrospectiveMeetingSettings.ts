import db from '../../../db'
import {MeetingTypeEnum} from '../../../postgres/types/Meeting'
import {ORG_HOTNESS_FACTOR, TEAM_HOTNESS_FACTOR} from '../../../utils/getTemplateScore'
import connectionFromTemplateArray from '../../queries/helpers/connectionFromTemplateArray'
import getScoredTemplates from '../../queries/helpers/getScoredTemplates'
import resolveSelectedTemplate from '../../queries/helpers/resolveSelectedTemplate'
import {RetrospectiveMeetingSettingsResolvers} from '../resolverTypes'

const RetrospectiveMeetingSettings: RetrospectiveMeetingSettingsResolvers = {
  __isTypeOf: ({meetingType}) => meetingType === 'retrospective',
  disableAnonymity: ({disableAnonymity}) => disableAnonymity ?? false,
  selectedTemplate: resolveSelectedTemplate('workingStuckTemplate'),

  reflectTemplates: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingTemplatesByType').load({teamId, meetingType: 'retrospective'})
  },

  teamTemplates: async ({teamId}, _args, {dataLoader}) => {
    const templates = await dataLoader
      .get('meetingTemplatesByType')
      .load({teamId, meetingType: 'retrospective' as MeetingTypeEnum})
    const scoredTemplates = await getScoredTemplates(templates, TEAM_HOTNESS_FACTOR)
    return scoredTemplates
  },

  organizationTemplates: async ({teamId}, {first, after}, {dataLoader}) => {
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    const {orgId} = team
    const templates = await dataLoader.get('meetingTemplatesByOrgId').load(orgId)
    const organizationTemplates = templates.filter(
      (template) =>
        template.scope !== 'TEAM' && template.teamId !== teamId && template.type === 'retrospective'
    )
    const scoredTemplates = await getScoredTemplates(organizationTemplates, ORG_HOTNESS_FACTOR)
    return connectionFromTemplateArray(scoredTemplates, first, after)
  },

  publicTemplates: async (_src, {first, after}) => {
    const publicTemplates = await db.read('publicTemplates', 'retrospective')
    publicTemplates.sort((a, b) => {
      if (a.isFree && !b.isFree) return -1
      if (!a.isFree && b.isFree) return 1
      return 0
    })
    return connectionFromTemplateArray(publicTemplates, first, after)
  }
}

export default RetrospectiveMeetingSettings
