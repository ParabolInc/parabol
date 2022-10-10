import {GraphQLResolveInfo} from 'graphql'
import {JiraGQLProject} from '../../../dataloader/atlassianLoaders'
import {AzureAccountProject} from '../../../dataloader/azureDevOpsLoaders'
import {JiraServerProject} from '../../../dataloader/jiraServerLoaders'
import {GQLContext} from '../../graphql'
import fetchGitHubRepos from './fetchGitHubRepos'
import fetchGitLabProjects from './fetchGitLabProjects'

type GitHubRepo = {
  id: string
  nameWithOwner: string
  service: 'github'
}

type GitLabProject = {
  id: string
  service: 'gitlab'
  __typename: 'Project'
  fullPath: string
}

export type RemoteRepoIntegration =
  | JiraGQLProject
  | GitHubRepo
  | GitLabProject
  | JiraServerProject
  | AzureAccountProject

const fetchAllRepoIntegrations = async (
  teamId: string,
  userId: string,
  context: GQLContext,
  info: GraphQLResolveInfo
) => {
  const {dataLoader} = context
  const [jiraProjects, githubRepos, gitlabProjects, jiraServerProjects, azureProjects] =
    await Promise.all([
      dataLoader.get('allJiraProjects').load({teamId, userId}),
      fetchGitHubRepos(teamId, userId, dataLoader, context, info),
      fetchGitLabProjects(teamId, userId, context, info),
      dataLoader.get('allJiraServerProjects').load({teamId, userId}),
      dataLoader.get('allAzureDevOpsProjects').load({teamId, userId})
    ])
  const fetchedRepoIntegrations: RemoteRepoIntegration[] = [
    ...jiraProjects,
    ...githubRepos,
    ...gitlabProjects,
    ...jiraServerProjects,
    ...azureProjects
  ]

  // alternate the repoIntegrations by service so the user is aware of all available services
  const repoIntegrationsAltServices: RemoteRepoIntegration[] = []
  let loopCount = 0
  while (repoIntegrationsAltServices.length < fetchedRepoIntegrations.length) {
    if (jiraProjects[loopCount]) {
      repoIntegrationsAltServices.push(jiraProjects[loopCount]!)
    }
    if (githubRepos[loopCount]) {
      repoIntegrationsAltServices.push(githubRepos[loopCount]!)
    }
    if (gitlabProjects[loopCount]) {
      repoIntegrationsAltServices.push(gitlabProjects[loopCount]!)
    }
    if (jiraServerProjects[loopCount]) {
      repoIntegrationsAltServices.push(jiraServerProjects[loopCount]!)
    }
    if (azureProjects[loopCount]) {
      repoIntegrationsAltServices.push(azureProjects[loopCount]!)
    }
    loopCount++
  }

  return repoIntegrationsAltServices
}

export default fetchAllRepoIntegrations
