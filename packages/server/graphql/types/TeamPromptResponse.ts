import {GraphQLFloat, GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'
import Team from './Team'

const TeamPromptResponse: GraphQLObjectType = new GraphQLObjectType<any, GQLContext>({
  name: 'TeamPromptResponse',
  description: 'A response of a single team member in a team prompt',
  isTypeOf: ({status}) => !!status,
  fields: () => ({
    createdBy: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The userId that created the item'
    },
    createdByUser: {
      type: new GraphQLNonNull(require('./User').default),
      description: 'The user that created the item',
      resolve: ({createdBy}, _args: unknown, {dataLoader}: GQLContext) => {
        return dataLoader.get('users').load(createdBy)
      }
    },
    context: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'the content of the response'
    },
    plaintextContent: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'the plain text content of the response'
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'the shared sort order for reponses'
    },
    team: {
      type: new GraphQLNonNull(Team),
      description: 'The team this response belongs to',
      resolve: ({teamId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('teams').load(teamId)
      }
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description:
        '* The userId, index useful for server-side methods getting all responses under a user.'
    },
    user: {
      type: require('./User').default,
      description: 'The user who created the response',
      resolve: ({userId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

export default TeamPromptResponse
