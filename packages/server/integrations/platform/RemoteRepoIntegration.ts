import type {LinearRepoIntegration} from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import type {JiraGQLProject} from '../../dataloader/atlassianLoaders'
import type {AzureAccountProject} from '../../dataloader/azureDevOpsLoaders'
import type {JiraServerProject} from '../../dataloader/jiraServerLoaders'

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

type LinearProjectRepo = LinearRepoIntegration & {
  displayName: string
}

type LinearTeamRepo = LinearRepoIntegration & {
  name: string
}

export type RemoteRepoIntegration =
  | JiraGQLProject
  | GitHubRepo
  | GitLabProject
  | JiraServerProject
  | AzureAccountProject
  | LinearProjectRepo
  | LinearTeamRepo
