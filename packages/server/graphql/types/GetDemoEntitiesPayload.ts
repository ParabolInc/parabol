import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import GoogleAnalyzedEntity from './GoogleAnalyzedEntity'
import StandardMutationError from './StandardMutationError'
import {GQLContext} from '../graphql'

const GetDemoEntitiesPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'GetDemoEntitiesPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    entities: {
      type: GraphQLList(GraphQLNonNull(GoogleAnalyzedEntity))
    }
  })
})

export default GetDemoEntitiesPayload
