import {GraphQLResolveInfo} from 'graphql'
import {LinearRepoIntegration} from '../../../../client/shared/gqlIds/IntegrationRepoId'
import {isNotNull} from '../../../../client/utils/predicates'
import {JiraGQLProject} from '../../../dataloader/atlassianLoaders'
import {AzureAccountProject} from '../../../dataloader/azureDevOpsLoaders'
import {JiraServerProject} from '../../../dataloader/jiraServerLoaders'
import {GQLContext} from '../../graphql'
import fetchGitHubRepos from './fetchGitHubRepos'
import fetchGitLabProjects from './fetchGitLabProjects'
import {fetchLinearProjects, fetchLinearTeams} from './fetchLinearTeamsAndProjects'

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

type LinearRepo = LinearProjectRepo | LinearTeamRepo

export type RemoteRepoIntegration =
  | JiraGQLProject
  | GitHubRepo
  | GitLabProject
  | JiraServerProject
  | AzureAccountProject
  | LinearRepo

const fetchAllRepoIntegrations = async (
  teamId: string,
  userId: string,
  context: GQLContext,
  info: GraphQLResolveInfo
) => {
  const {dataLoader} = context
  const [
    jiraProjects,
    githubRepos,
    gitlabProjects,
    jiraServerProjects,
    azureProjects,
    linearProjects,
    linearTeams
  ] = await Promise.all([
    dataLoader.get('allJiraProjects').load({teamId, userId}),
    fetchGitHubRepos(teamId, userId, dataLoader, context, info),
    fetchGitLabProjects(teamId, userId, context, info),
    dataLoader.get('allJiraServerProjects').load({teamId, userId}),
    dataLoader.get('allAzureDevOpsProjects').load({teamId, userId}),
    fetchLinearProjects(teamId, userId, context, info),
    fetchLinearTeams(teamId, userId, context, info)
  ])
  const repos: RemoteRepoIntegration[][] = [
    jiraProjects,
    githubRepos,
    gitlabProjects,
    jiraServerProjects,
    azureProjects,
    linearProjects,
    linearTeams
  ]
  const maxRepos = Math.max(...repos.map((repo) => repo.length))
  return new Array(maxRepos)
    .fill(0)
    .map((_, idx) => repos.map((repoArr) => repoArr[idx]).filter(isNotNull))
    .flat()
}

export default fetchAllRepoIntegrations
