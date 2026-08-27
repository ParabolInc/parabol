import type {
  GitHubRepoIntegration,
  GitLabRepoIntegration,
  LinearRepoIntegration
} from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import type {JiraGQLProject} from '../../dataloader/atlassianLoaders'
import type {AzureAccountProject} from '../../dataloader/azureDevOpsLoaders'
import type {JiraServerProject} from '../../dataloader/jiraServerLoaders'

export type GitHubRepo = GitHubRepoIntegration & {id: string}

export type GitLabProject = GitLabRepoIntegration & {id: string; __typename: 'Project'}

export type LinearRepo = LinearRepoIntegration & ({displayName: string} | {name: string})

export type RemoteRepoIntegration =
  | JiraGQLProject
  | GitHubRepo
  | GitLabProject
  | JiraServerProject
  | AzureAccountProject
  | LinearRepo
