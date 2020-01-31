import {GraphQLID, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import StandardMutationError from './StandardMutationError'
import User from './User'

const VerifyEmailPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'VerifyEmailPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    authToken: {
      type: GraphQLID,
      description: 'The new auth token sent to the mutator'
    },
    userId: {
      type: GraphQLID
    },
    user: {
      type: User,
      resolve: ({userId}, _args, {dataLoader}) => {
        return userId ? dataLoader.get('users').load(userId) : null
      }
    }
  })
})

export default VerifyEmailPayload
