import {GraphQLFloat, GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'
import Reactable, {reactableFields} from './Reactable'
import Team from './Team'

const TeamPromptResponse: GraphQLObjectType = new GraphQLObjectType<any, GQLContext>({
  name: 'TeamPromptResponse',
  description: 'A response of a single team member in a team prompt',
  interfaces: () => [Reactable],
  fields: () => ({
    ...reactableFields(),
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Id of the user who created the team prompt response'
    },
    user: {
      type: require('./User').default,
      description: 'The user who created the response',
      resolve: ({userId}: {userId: string}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    },
    content: {
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
      resolve: ({teamId}: {teamId: string}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('teams').load(teamId)
      }
    }
  })
})

export default TeamPromptResponse
