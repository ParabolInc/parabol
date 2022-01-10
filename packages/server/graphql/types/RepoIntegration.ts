import {IXGitHubRepository} from './../../../client/types/graphql'
import {GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'
import JiraRemoteProject from './JiraRemoteProject'
import SuggestedIntegrationGitHub from './SuggestedIntegrationGitHub'
import SuggestedIntegrationJira from './SuggestedIntegrationJira'
import TaskServiceEnum from './TaskServiceEnum'

export const repoIntegrationFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID),
    resolve: ({id}: {id: string}) => {
      return `sa:${id}`
    }
  }
})

const resolveTypeLookup = {
  // github: IXGitHubRepository,
  github: SuggestedIntegrationGitHub,
  jira: JiraRemoteProject
}

const RepoIntegration = new GraphQLInterfaceType({
  name: 'RepoIntegration',
  fields: repoIntegrationFields,
  resolveType(value) {
    // console.log('🚀  ~ RESOLVE', value)
    return resolveTypeLookup.jira
  }
})

export default RepoIntegration
