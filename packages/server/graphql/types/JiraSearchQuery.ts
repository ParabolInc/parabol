import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'

const JiraSearchQuery = new GraphQLObjectType<any, GQLContext>({
  name: 'JiraSearchQuery',
  description: 'A jira search query including all filters selected when the query was executed',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    queryString: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The query string, either simple or JQL depending on the isJQL flag'
    },
    isJQL: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the queryString is JQL, else false',
      resolve: ({isJQL}) => !!isJQL
    },
    projectKeyFilters: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: 'The list of project keys selected as a filter. null if not set',
      resolve: ({projectKeyFilters}) => projectKeyFilters || []
    },
    lastUsedAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'the time the search query was last used. Used for sorting'
    }
  })
})

export default JiraSearchQuery
