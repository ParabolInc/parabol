import MeetingTemplate from '../../../database/types/MeetingTemplate'
import db from '../../../db'
import {ORG_HOTNESS_FACTOR, TEAM_HOTNESS_FACTOR} from '../../../utils/getTemplateScore'
import connectionFromTemplateArray from '../../queries/helpers/connectionFromTemplateArray'
import getScoredTemplates from '../../queries/helpers/getScoredTemplates'
import resolveSelectedTemplate from '../../queries/helpers/resolveSelectedTemplate'
import {PokerMeetingSettingsResolvers} from '../resolverTypes'

const PokerMeetingSettings: PokerMeetingSettingsResolvers = {
  __isTypeOf: ({meetingType}) => meetingType === 'poker',
  selectedTemplate: resolveSelectedTemplate<'poker'>('estimatedEffortTemplate'),

  teamTemplates: async ({teamId}, _args, {dataLoader}) => {
    const templates = await dataLoader
      .get('meetingTemplatesByType')
      .load({teamId, meetingType: 'poker'})
    const scoredTemplates = await getScoredTemplates(templates, TEAM_HOTNESS_FACTOR)
    return scoredTemplates
  },

  organizationTemplates: async ({teamId}, {first, after}, {dataLoader}) => {
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    const {orgId} = team
    const templates = await dataLoader.get('meetingTemplatesByOrgId').load(orgId)
    const organizationTemplates = templates.filter(
      (template: MeetingTemplate) =>
        template.scope !== 'TEAM' && template.teamId !== teamId && template.type === 'poker'
    )
    const scoredTemplates = await getScoredTemplates(organizationTemplates, ORG_HOTNESS_FACTOR)
    return connectionFromTemplateArray(scoredTemplates, first, after)
  },

  publicTemplates: async (_src, {first, after}) => {
    const publicTemplates = await db.read('publicTemplates', 'poker')
    publicTemplates.sort((a, b) => {
      if (a.isFree && !b.isFree) return -1
      if (!a.isFree && b.isFree) return 1
      return 0
    })
    return connectionFromTemplateArray(publicTemplates, first, after)
  }
}

export default PokerMeetingSettings
