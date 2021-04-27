import {GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'

const GitHubRepository = new GraphQLObjectType<any, GQLContext>({
  name: 'GitHubRepository',
  description: 'A repository that comes directly from GitHub',
  fields: () => ({
    nameWithOwner: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The owner / repo of the issue as found in GitHub'
    }
  })
})

export default GitHubRepository
