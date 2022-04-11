import {GraphQLBoolean, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'

const UpdateWatchlistSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdateWatchlistSuccess',
  fields: () => ({
    success: {
      type: GraphQLBoolean,
      description: 'true if the mutation was successfully executed'
    }
  })
})

const UpdateWatchlistPayload = makeMutationPayload('UpdateWatchlistPayload', UpdateWatchlistSuccess)

export default UpdateWatchlistPayload
