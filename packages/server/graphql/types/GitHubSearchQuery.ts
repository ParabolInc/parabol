import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'

const GitHubSearchQuery = new GraphQLObjectType<any, GQLContext>({
  name: 'GitHubSearchQuery',
  description: 'A GitHub search query including all filters selected when the query was executed',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    queryString: {
      type: GraphQLNonNull(GraphQLString),
      description:
        'The query string in GitHub format, including repository filters. e.g. is:issue is:open'
    },
    lastUsedAt: {
      type: GraphQLNonNull(GraphQLISO8601Type),
      description: 'the time the search query was last used. Used for sorting'
    }
  })
})

export default GitHubSearchQuery
