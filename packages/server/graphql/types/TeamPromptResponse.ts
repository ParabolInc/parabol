import {JSONContent} from '@tiptap/core'
import {GraphQLFloat, GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import Reactable, {reactableFields} from './Reactable'
import Team from './Team'

const TeamPromptResponse: GraphQLObjectType = new GraphQLObjectType<any, GQLContext>({
  name: 'TeamPromptResponse',
  description: 'A response of a single team member in a team prompt',
  interfaces: () => [Reactable],
  fields: () => ({
    ...reactableFields(),
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description:
        'Team prompt response id in a format of `teamPromptResponse:idGeneratedByDatabase`'
    },
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
      description: 'the content of the response',
      resolve: ({content}: {content: JSONContent}) => {
        return JSON.stringify(content)
      }
    },
    plaintextContent: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'the plain text content of the response'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the response was created'
    },
    updatedAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the response was updated at'
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
