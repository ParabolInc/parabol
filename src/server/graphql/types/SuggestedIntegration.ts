import {GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'
import SuggestedIntegrationGitHub from 'server/graphql/types/SuggestedIntegrationGitHub'
import SuggestedIntegrationJira from 'server/graphql/types/SuggestedIntegrationJira'
import TaskServiceEnum from 'server/graphql/types/TaskServiceEnum'

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
  jira: SuggestedIntegrationJira
}

const SuggestedIntegration = new GraphQLInterfaceType({
  name: 'SuggestedIntegration',
  fields: suggestedIntegrationFields,
  resolveType (value) {
    return resolveTypeLookup[value.service]
  }
})

export default SuggestedIntegration
