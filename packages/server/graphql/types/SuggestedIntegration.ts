import {GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'
import SuggestedIntegrationGitHub from './SuggestedIntegrationGitHub'
import SuggestedIntegrationJira from './SuggestedIntegrationJira'
import SuggestedIntegrationAzureDevops from './SuggestedIntegrationAzureDevops'
import TaskServiceEnum from './TaskServiceEnum'

export const suggestedIntegrationFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID)
  },
  service: {
    type: new GraphQLNonNull(TaskServiceEnum)
  }
})

const resolveTypeLookup = {
  github: SuggestedIntegrationGitHub,
  jira: SuggestedIntegrationJira,
  azuredevops: SuggestedIntegrationAzureDevops
}

const SuggestedIntegration = new GraphQLInterfaceType({
  name: 'SuggestedIntegration',
  fields: suggestedIntegrationFields,
  resolveType(value) {
    return resolveTypeLookup[value.service]
  }
})

export default SuggestedIntegration
