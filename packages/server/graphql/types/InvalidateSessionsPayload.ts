import {GraphQLObjectType} from 'graphql'
import type {GQLContext} from '../graphql'
import StandardMutationError from './StandardMutationError'

const InvalidateSessionsPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'InvalidateSessionsPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    }
  })
})

export default InvalidateSessionsPayload
