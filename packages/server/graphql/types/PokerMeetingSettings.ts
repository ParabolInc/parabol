import {GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import MeetingTemplate from '../../database/types/MeetingTemplate'
import db from '../../db'
import {GQLContext} from '../graphql'
import connectionFromTemplateArray from '../queries/helpers/connectionFromTemplateArray'
import getScoredTemplates from '../queries/helpers/getScoredTemplates'
import resolveSelectedTemplate from '../queries/helpers/resolveSelectedTemplate'
import PokerTemplate, {PokerTemplateConnection} from './PokerTemplate'
import TeamMeetingSettings, {teamMeetingSettingsFields} from './TeamMeetingSettings'

const PokerMeetingSettings = new GraphQLObjectType<any, GQLContext>({
  name: 'PokerMeetingSettings',
  description: 'The retro-specific meeting settings',
  interfaces: () => [TeamMeetingSettings],
  fields: () => ({
    ...teamMeetingSettingsFields(),
    selectedTemplateId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'FK. The template that will be used to start the poker meeting'
    },
    selectedTemplate: {
      type: new GraphQLNonNull(PokerTemplate),
      description: 'The template that will be used to start the Poker meeting',
      resolve: resolveSelectedTemplate('estimatedEffortTemplate')
    },
    teamTemplates: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PokerTemplate))),
      description: 'The list of templates used to start a Poker meeting',
      resolve: async ({teamId}, _args: unknown, {dataLoader}) => {
        const templates = await dataLoader
          .get('meetingTemplatesByType')
          .load({teamId, meetingType: 'poker'})
        const scoredTemplates = await getScoredTemplates(templates, 0.9)
        return scoredTemplates
      }
    },
    organizationTemplates: {
      type: new GraphQLNonNull(PokerTemplateConnection),
      args: {
        first: {
          type: new GraphQLNonNull(GraphQLInt)
        },
        after: {
          type: GraphQLID,
          description: 'The cursor, which is the templateId'
        }
      },
      description: 'The list of templates shared across the organization to start a Poker meeting',
      resolve: async ({teamId}, {first, after}, {dataLoader}) => {
        const team = await dataLoader.get('teams').loadNonNull(teamId)
        const {orgId} = team
        const templates = await dataLoader.get('meetingTemplatesByOrgId').load(orgId)
        const organizationTemplates = templates.filter(
          (template: MeetingTemplate) =>
            template.scope !== 'TEAM' && template.teamId !== teamId && template.type === 'poker'
        )
        const scoredTemplates = await getScoredTemplates(organizationTemplates, 0.8)
        return connectionFromTemplateArray(scoredTemplates, first, after)
      }
    },
    publicTemplates: {
      type: new GraphQLNonNull(PokerTemplateConnection),
      description: 'The list of templates shared across the organization to start a Poker meeting',
      args: {
        first: {
          type: new GraphQLNonNull(GraphQLInt)
        },
        after: {
          type: GraphQLID,
          description: 'The cursor, which is the templateId'
        }
      },
      resolve: async (_src, {first, after}) => {
        const publicTemplates = await db.read('publicTemplates', 'poker')
        publicTemplates.sort((a, b) => {
          if (a.isFree && !b.isFree) return -1
          if (!a.isFree && b.isFree) return 1
          return 0
        })
        return connectionFromTemplateArray(publicTemplates, first, after)
      }
    }
  })
})

export default PokerMeetingSettings
