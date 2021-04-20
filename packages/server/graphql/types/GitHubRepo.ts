import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import PageInfoDateCursor from './PageInfoDateCursor'
import StandardMutationError from './StandardMutationError'

const GitHubRepo = new GraphQLObjectType<any, GQLContext>({
  name: 'GitHubRepo',
  description: 'The GitHub Repo that we get directly from GitHub',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The id of the issue as found in GitHub'
    },
    nameWithOwner: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The owner / repo of the issue as found in GitHub'
    },
    service: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The owner / repo of the issue as found in GitHub'
    }
  })
})

const {connectionType, edgeType} = connectionDefinitions({
  name: GitHubRepo.name,
  nodeType: GitHubRepo,
  edgeFields: () => ({
    cursor: {
      type: GraphQLISO8601Type
    }
  }),
  connectionFields: () => ({
    pageInfo: {
      type: PageInfoDateCursor,
      description: 'Page info with cursors coerced to ISO8601 dates'
    },
    error: {
      type: StandardMutationError,
      description: 'An error with the connection, if any'
    }
  })
})

export const GitHubRepoConnection = connectionType
export const GitHubRepoEdge = edgeType
export default GitHubRepo
