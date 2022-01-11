import {GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'
import RepoIntegration, {repoIntegrationFields} from './RepoIntegration'

const GitHubRepo = new GraphQLObjectType<any, GQLContext>({
  name: 'GitHubRepo',
  description: 'A repo fetched from GitHub in real time',
  interfaces: () => [RepoIntegration],
  isTypeOf: ({nameWithOwner}) => {
    console.log('🚀  ~ gh repo nameWithOwner....', {nameWithOwner})
    return !!nameWithOwner
  },
  fields: () => ({
    ...repoIntegrationFields(),
    nameWithOwner: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The unique name of the GitHub repository',
      resolve: (src) => {
        console.log('🚀  ~ GH repo .. src', src)
        return src.nameWithOwner
      }
    }
  })
})

export default GitHubRepo
