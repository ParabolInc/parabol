import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveTeam} from '../resolvers'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import Team from './Team'
import TemplateScaleValue from './TemplateScaleValue'

const TemplateScale = new GraphQLObjectType<any, GQLContext>({
  name: 'TemplateScale',
  description: 'A team-specific template scale.',
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
      description: 'true if the scale is currently used by the team, else false'
    },
    removedAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime that the scale was removed. Null if it has not been removed.'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'foreign key. use the team field'
    },
    team: {
      type: new GraphQLNonNull(Team),
      description: 'The team that owns this template scale',
      resolve: resolveTeam
    },
    updatedAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type)
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The title of the scale used in the template'
    },
    values: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TemplateScaleValue))),
      description: 'The values used in this scale',
      resolve: ({id, values}) => {
        return values.map((value) => ({
          ...value,
          scaleId: id
        }))
      }
    }
  })
})

export default TemplateScale
