import {GraphQLObjectType} from 'graphql'
import type {GQLContext} from '../graphql'
import StandardMutationError from './StandardMutationError'

const DeleteUserPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'DeleteUserPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    }
  })
})

export default DeleteUserPayload
