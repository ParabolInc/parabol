import type {JiraGQLProject} from '../../dataloader/atlassianLoaders'
import type {AzureAccountProject} from '../../dataloader/azureDevOpsLoaders'
import type {JiraServerProject} from '../../dataloader/jiraServerLoaders'
import type {GitHubRepo} from '../github/GitHubRepo'
import type {GitLabProject} from '../gitlab/GitLabProject'
import type {LinearRepo} from '../linear/LinearRepo'

export type RemoteRepoIntegration =
  | JiraGQLProject
  | GitHubRepo
  | GitLabProject
  | JiraServerProject
  | AzureAccountProject
  | LinearRepo
