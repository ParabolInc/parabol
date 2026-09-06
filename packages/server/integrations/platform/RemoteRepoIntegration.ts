import type {
  GitHubRepoIntegration,
  GitLabRepoIntegration,
  LinearRepoIntegration
} from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import type {JiraGQLProject} from '../../dataloader/atlassianLoaders'
import type {AzureAccountProject} from '../../dataloader/azureDevOpsLoaders'
import type {JiraServerProject} from '../../dataloader/jiraServerLoaders'
import type {GetProjectsQuery as GetGitLabProjectsQuery} from '../../types/gitlabTypes'
import type {GetProjectsQuery, GetTeamsAndProjectsQuery} from '../../types/linearTypes'

export type GitHubRepo = GitHubRepoIntegration & {id: string}

type GitLabProjectNode = NonNullable<
  NonNullable<NonNullable<GetGitLabProjectsQuery['projects']>['edges']>[number]
>['node']

export type GitLabProject = GitLabRepoIntegration & NonNullable<GitLabProjectNode>

export type LinearTeam = LinearRepoIntegration &
  GetTeamsAndProjectsQuery['teams']['edges'][number]['node']

export type LinearProject = LinearRepoIntegration &
  GetProjectsQuery['projects']['edges'][number]['node']

export type LinearRepo = LinearTeam | LinearProject

export type RemoteRepoIntegration =
  | JiraGQLProject
  | GitHubRepo
  | GitLabProject
  | JiraServerProject
  | AzureAccountProject
  | LinearRepo
