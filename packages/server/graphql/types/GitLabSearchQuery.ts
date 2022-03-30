import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'

const GitHubSearchQuery = new GraphQLObjectType<any, GQLContext>({
  name: 'GitHubSearchQuery',
  description: 'A GitHub search query including all filters selected when the query was executed',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    queryString: {
      type: new GraphQLNonNull(GraphQLString),
      description:
        'The query string in GitHub format, including repository filters. e.g. is:issue is:open'
    },
    projectFilters: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: 'The list of projects selected as a filter',
      resolve: (testa) => {
        console.log('🚀  ~ projectFilters', {testa})
        return testa.projectFilters || []
      }
    }
  })
})

export default GitHubSearchQuery
