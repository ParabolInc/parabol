import {GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'
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
  // [GITHUB]: SuggestedProviderGitHub,
  // atlassian: SuggestedProviderAtlassian
}

const SuggestedIntegration = new GraphQLInterfaceType({
  name: 'SuggestedIntegration',
  fields: suggestedIntegrationFields,
  resolveType (value) {
    return resolveTypeLookup[value.service]
  }
})

export default SuggestedIntegration
