import {GraphQLBoolean, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import SuggestedIntegration from './SuggestedIntegration'
import StandardMutationError from './StandardMutationError'
import {GQLContext} from '../graphql'

const SuggestedIntegrationQueryPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'SuggestedIntegrationQueryPayload',
  description: 'The details associated with a task integrated with GitHub',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    hasMore: {
      type: GraphQLBoolean,
      description:
        'true if the items returned are a subset of all the possible integration, else false (all possible integrations)'
    },
    items: {
      type: new GraphQLList(new GraphQLNonNull(SuggestedIntegration)),
      description: 'All the integrations that are likely to be integrated'
    }
  })
})

export default SuggestedIntegrationQueryPayload
