import {GraphQLNonNull, GraphQLObjectType, GraphQLID} from 'graphql'
import {repoIntegrationFields} from './RepoIntegration'
import {GQLContext} from '../graphql'
import RepoIntegration from './RepoIntegration'

const SuggestedIntegrationGitHub = new GraphQLObjectType<any, GQLContext>({
  name: 'SuggestedIntegrationGitHub',
  description: 'The details associated with a task integrated with GitHub',
  interfaces: () => [RepoIntegration],
  fields: () => ({
    ...repoIntegrationFields(),
    nameWithOwner: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The name of the repo. Follows format of OWNER/NAME'
    }
  })
})

export default SuggestedIntegrationGitHub
