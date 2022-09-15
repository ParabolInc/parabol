import {GraphQLBoolean, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import RepoIntegration from './RepoIntegration'
import StandardMutationError from './StandardMutationError'

const RepoIntegrationQueryPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'RepoIntegrationQueryPayload',
  description: 'The details associated with the possible repo and project integrations',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    hasMore: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description:
        'true if the items returned are a subset of all the possible integration, else false (all possible integrations)'
    },
    items: {
      type: new GraphQLList(new GraphQLNonNull(RepoIntegration)),
      description: 'All the integrations that are likely to be integrated'
    }
  })
})

export default RepoIntegrationQueryPayload
