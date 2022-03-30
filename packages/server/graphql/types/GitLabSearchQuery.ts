import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'

const GitLabSearchQuery = new GraphQLObjectType<any, GQLContext>({
  name: 'GitLabSearchQuery',
  description: 'A GitLab search query including all filters selected when the query was executed',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    queryString: {
      type: new GraphQLNonNull(GraphQLString),
      description:
        'The query string in GitLab format, including repository filters. e.g. is:issue is:open'
    },
    selectedProjectsIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: 'The list of the fullPaths of projects that have been selected as a filter',
      resolve: (testa) => {
        console.log('🚀  ~ projectFilters', {testa})
        return testa.selectedProjectsIds || []
      }
    },
    lastUsedAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'the time the search query was last used. Used for sorting'
    }
  })
})

export default GitLabSearchQuery
