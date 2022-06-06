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

const AzureDevOpsSearchQuery = new GraphQLObjectType<any, GQLContext>({
  name: 'AzureDevOpsSearchQuery',
  description:
    'An Azure DevOps search query including all filters selected when the query was executed',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    queryString: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The query string, either simple or WIQL depending on the isWIQL flag'
    },
    projectKeyFilters: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))),
      description: 'A list of projects to restrict the search to'
    },
    isWIQL: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the queryString is WIQL, else false',
      resolve: ({isWIQL}) => !!isWIQL
    },
    lastUsedAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'the time the search query was last used. Used for sorting'
    }
  })
})

export default AzureDevOpsSearchQuery
