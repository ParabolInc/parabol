import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import db from '../../db'
import {GQLContext} from '../graphql'
import {resolveTeam} from '../resolvers'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import PokerTemplate from './PokerTemplate'
import Team from './Team'
import TemplateScale from './TemplateScale'

const TemplateDimension = new GraphQLObjectType<any, GQLContext>({
  name: 'TemplateDimension',
  description: 'A team-specific template dimension: e.g., effort, importance etc.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type)
    },
    isActive: {
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: ({removedAt}) => !removedAt,
      description: 'true if the dimension is currently used by the team, else false'
    },
    removedAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime that the dimension was removed. Null if it has not been removed.'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'foreign key. use the team field'
    },
    team: {
      type: new GraphQLNonNull(Team),
      description: 'The team that owns this dimension',
      resolve: resolveTeam
    },
    updatedAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type)
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'the order of the dimensions in the template'
    },
    templateId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'FK for template'
    },
    template: {
      type: new GraphQLNonNull(PokerTemplate),
      description: 'The template that this dimension belongs to',
      resolve: ({templateId}, _args, {dataLoader}) => {
        return dataLoader.get('meetingTemplates').load(templateId)
      }
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the dimension'
    },
    description: {
      description:
        'The description to the dimension name for further context. A long version of the dimension name.',
      type: new GraphQLNonNull(GraphQLString),
      resolve: ({description}) => description || ''
    },
    selectedScale: {
      type: new GraphQLNonNull(TemplateScale),
      description: 'scale used in this dimension',
      resolve: ({scaleId}, _args, {dataLoader}) => {
        return dataLoader.get('templateScales').load(scaleId)
      }
    },
    availableScales: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TemplateScale))),
      description: 'The list of scales can be set for this dimension',
      resolve: async ({teamId}, _args, {dataLoader}) => {
        const activeTeamScales = await dataLoader.get('scalesByTeamId').load(teamId)
        const publicScales = await db.read('starterScales', 'aGhostTeam')
        const activeScales = [...activeTeamScales, ...publicScales]
        return activeScales.sort((a, b) => (a.sortOrder < b.sortOrder ? -1 : 1))
      }
    }
  })
})

export default TemplateDimension
