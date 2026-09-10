import type {JiraGQLProject} from '../../dataloader/atlassianLoaders'
import type {AzureAccountProject} from '../../dataloader/azureDevOpsLoaders'
import type {JiraServerProject} from '../../dataloader/jiraServerLoaders'
import type {GetRepositoriesQuery} from '../../types/githubTypes'
import type {GetProjectsQuery as GetGitLabProjectsQuery} from '../../types/gitlabTypes'
import type {GetProjectsQuery, GetTeamsAndProjectsQuery} from '../../types/linearTypes'

type GitHubRepoNode = NonNullable<
  NonNullable<GetRepositoriesQuery['viewer']['repositories']['nodes']>[number]
>

export type GitHubRepo = GitHubRepoNode & {service: 'github'}

type GitLabProjectNode = NonNullable<
  NonNullable<NonNullable<GetGitLabProjectsQuery['projects']>['edges']>[number]
>['node']

export type GitLabProject = NonNullable<GitLabProjectNode> & {service: 'gitlab'}

export type LinearTeam = GetTeamsAndProjectsQuery['teams']['edges'][number]['node'] & {
  service: 'linear'
}

type LinearProjectNode = GetProjectsQuery['projects']['edges'][number]['node']
type LinearProjectTeam = LinearProjectNode['teams']['nodes'][number]

/** Only projects with a team are cached; the id and the label both need it */
export type LinearProject = LinearProjectNode & {
  service: 'linear'
  teams: {nodes: [LinearProjectTeam, ...LinearProjectTeam[]]}
}

export type LinearRepo = LinearTeam | LinearProject

export type VendorRepoIntegration = GitHubRepo | GitLabProject | LinearRepo

export type RemoteRepoIntegration =
  | JiraGQLProject
  | GitHubRepo
  | GitLabProject
  | JiraServerProject
  | AzureAccountProject
  | LinearRepo
