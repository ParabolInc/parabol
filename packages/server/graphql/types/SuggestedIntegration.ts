import {GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'
import SuggestedIntegrationGitHub from './SuggestedIntegrationGitHub'
import SuggestedIntegrationJira from './SuggestedIntegrationJira'
import TaskServiceEnum from './TaskServiceEnum'

export const suggestedIntegrationFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID),
    resolve: ({id}: {id: string}) => {
      return `sa:${id}`
    }
  },
  service: {
    type: new GraphQLNonNull(TaskServiceEnum)
  }
})

const resolveTypeLookup = {
  github: SuggestedIntegrationGitHub,
  jira: SuggestedIntegrationJira
}

const SuggestedIntegration: GraphQLInterfaceType = new GraphQLInterfaceType({
  name: 'SuggestedIntegration',
  fields: suggestedIntegrationFields,
  resolveType({service}: {service: keyof typeof resolveTypeLookup}) {
    return resolveTypeLookup[service]
  }
})

export default SuggestedIntegration
