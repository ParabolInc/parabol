import {GraphQLNonNull, GraphQLObjectType, GraphQLID} from 'graphql'
import SuggestedIntegration, {suggestedIntegrationFields} from './SuggestedIntegration'
import {GQLContext} from '../graphql'

const SuggestedIntegrationGitHub = new GraphQLObjectType<any, GQLContext>({
  name: 'SuggestedIntegrationGitHub',
  description: 'The details associated with a task integrated with GitHub',
  interfaces: () => [SuggestedIntegration],
  fields: () => ({
    ...suggestedIntegrationFields(),
    nameWithOwner: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The name of the repo. Follows format of OWNER/NAME'
    }
  })
})

export default SuggestedIntegrationGitHub
