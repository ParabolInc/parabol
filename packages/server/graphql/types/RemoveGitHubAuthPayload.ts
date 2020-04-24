import {GraphQLID, GraphQLObjectType} from 'graphql'
import StandardMutationError from './StandardMutationError'
import User from './User'
import {GQLContext} from '../graphql'

const RemoveGitHubAuthPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'RemoveGitHubAuthPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    authId: {
      type: GraphQLID,
      description: 'The ID of the authorization removed'
    },
    teamId: {
      type: GraphQLID
    },
    user: {
      type: User,
      description: 'The user with updated githubAuth',
      resolve: ({userId}, _args, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

export default RemoveGitHubAuthPayload
