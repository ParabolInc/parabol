import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
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
    selectedProjectsIds: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLID)),
      description:
        'The list of ids of projects that have been selected as a filter. Null if none have been selected',
      resolve: ({selectedProjectsIds}) => selectedProjectsIds
    },
    lastUsedAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'the time the search query was last used. Used for sorting'
    }
  })
})

export default GitLabSearchQuery
