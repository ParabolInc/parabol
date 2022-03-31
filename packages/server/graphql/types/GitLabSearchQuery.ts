import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'

const GitLabSearchQuery = new GraphQLObjectType<any, GQLContext>({
  name: 'GitLabSearchQuery',
  description: 'A GitLab search query including the search query and the project filters',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    queryString: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The query string used to search GitLab issue titles and descriptions'
    },
    lastUsedAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'the time the search query was last used. Used for sorting'
    }
  })
})

export default GitLabSearchQuery
