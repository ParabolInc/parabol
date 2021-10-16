import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import {getUserId} from '../../utils/authorization'
import {GQLContext} from '../graphql'

const MattermostIntegration = new GraphQLObjectType<any, GQLContext>({
  name: 'MattermostIntegration',
  description: 'OAuth token for a team member',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    isActive: {
      description: 'true if the auth is updated & ready to use for all features, else false',
      type: new GraphQLNonNull(GraphQLBoolean)
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*The team that the token is linked to'
    },
    updatedAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the token was updated at'
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the user that integrated Slack'
    }
  })
})

export default MattermostIntegration
