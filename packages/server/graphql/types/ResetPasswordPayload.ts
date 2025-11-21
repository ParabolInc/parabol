import {GraphQLID, GraphQLObjectType} from 'graphql'
import type {GQLContext} from '../graphql'
import StandardMutationError from './StandardMutationError'
import User from './User'

const ResetPasswordPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'ResetPasswordPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    userId: {
      type: GraphQLID
    },
    user: {
      type: User,
      description: 'the user that changed their password',
      resolve: ({userId}, _args: unknown, {dataLoader}) => {
        return userId ? dataLoader.get('users').load(userId) : null
      }
    }
  })
})

export default ResetPasswordPayload
