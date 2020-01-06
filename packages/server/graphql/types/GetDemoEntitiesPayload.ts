import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import GoogleAnalyzedEntity from './GoogleAnalyzedEntity'
import StandardMutationError from './StandardMutationError'

const GetDemoEntitiesPayload = new GraphQLObjectType({
  name: 'GetDemoEntitiesPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    entities: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(GoogleAnalyzedEntity)))
    }
  })
})

export default GetDemoEntitiesPayload
