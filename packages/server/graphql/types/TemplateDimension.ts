import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveTeam} from '../resolvers'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import PokerTemplate from './PokerTemplate'
import Team from './Team'
import TemplateScale from './TemplateScale'

const TemplateDimension = new GraphQLObjectType<any, GQLContext>({
  name: 'TemplateDimension',
  description:
    'A team-specific template dimension: e.g., effort, importance etc.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type)
    },
    isActive: {
      type: GraphQLBoolean,
      description: 'true if the dimension is currently used by the team, else false'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'foreign key. use the team field'
    },
    team: {
      type: Team,
      description: 'The team that owns this dimension',
      resolve: resolveTeam
    },
    updatedAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type)
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
      description:
        'The name of the dimension'
    },
    scale: {
      type: new GraphQLNonNull(TemplateScale),
      description: 'scale used in this dimension',
      resolve: ({scaleId}, _args, {dataLoader}) => {
        return dataLoader.get('templateScales').load(scaleId)
      }
    }
  })
})

export default TemplateDimension