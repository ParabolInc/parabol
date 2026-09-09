jest.mock('../../rootSchema', () => ({
  __esModule: true,
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn(),
  default: {}
}))

import type {GraphQLResolveInfo} from 'graphql'
import type {GQLContext} from '../../../graphql'
import AzureDevOpsRemoteProject from '../AzureDevOpsRemoteProject'
import JiraRemoteProject from '../JiraRemoteProject'
import JiraServerRemoteProject from '../JiraServerRemoteProject'
import RepoContainer from '../RepoContainer'

const context = {} as GQLContext
const info = {} as GraphQLResolveInfo

const resolveName = (resolvers: {name?: unknown}, source: Record<string, unknown>) => {
  const field = resolvers.name
  if (typeof field === 'function') return field(source, {}, context, info)
  return source.name
}

const gitHubRepository = {
  id: 'MDEwOlJlcG9zaXRvcnkx',
  service: 'github' as const,
  nameWithOwner: 'octocat/hello-world'
}

const gitLabProject = {
  __typename: 'Project' as const,
  id: 'gid://gitlab/Project/1',
  fullPath: 'gitlab-org/gitlab',
  service: 'gitlab' as const
}

const linearTeam = {
  __typename: 'Team' as const,
  id: 'team-uuid',
  displayName: 'Engineering',
  key: 'ENG',
  service: 'linear' as const,
  teamId: 'team-uuid'
}

const jiraRemoteProject = {
  self: 'https://api.atlassian.com/ex/jira/cloud-1/rest/api/2/project/10000',
  id: '10000',
  key: 'PAR',
  name: 'Parabol',
  avatarUrls: {'48x48': 'https://example.com/48.png'},
  service: 'jira' as const,
  cloudId: 'cloud-1',
  teamId: 'team-uuid',
  userId: 'user-uuid'
}

const jiraServerRemoteProject = {
  expand: 'description,lead,url',
  self: 'https://jira.example.com/rest/api/2/project/10000',
  id: '10000',
  key: 'PAR',
  name: 'Parabol',
  avatarUrls: {'48x48': 'https://jira.example.com/48.png'},
  service: 'jiraServer' as const,
  providerId: 7,
  userId: 'user-uuid',
  teamId: 'team-uuid'
}

const azureDevOpsRemoteProject = {
  id: 'project-guid',
  name: 'Parabol',
  url: 'https://dev.azure.com/parabol/_apis/projects/project-guid',
  state: 'wellFormed',
  visibility: 'private',
  instanceId: 'dev.azure.com/parabol',
  projectId: 'project-guid',
  service: 'azureDevOps' as const,
  userId: 'user-uuid',
  teamId: 'team-uuid'
}

type NameCase = [string, {name?: unknown}, Record<string, unknown>, string]

const cases: NameCase[] = [
  ['RepoContainer(github)', RepoContainer, gitHubRepository, 'octocat/hello-world'],
  ['RepoContainer(gitlab)', RepoContainer, gitLabProject, 'gitlab-org/gitlab'],
  ['RepoContainer(linear team)', RepoContainer, linearTeam, 'Engineering'],
  ['JiraRemoteProject', JiraRemoteProject, jiraRemoteProject, 'Parabol'],
  ['JiraServerRemoteProject', JiraServerRemoteProject, jiraServerRemoteProject, 'Parabol'],
  ['AzureDevOpsRemoteProject', AzureDevOpsRemoteProject, azureDevOpsRemoteProject, 'Parabol']
]

describe('RepoIntegration.name', () => {
  it.each(cases)(
    '%s resolves the non-null name a picker renders',
    (_typeName, resolvers, source, expected) => {
      const name = resolveName(resolvers, source)
      expect(typeof name).toBe('string')
      expect(name).toBe(expected)
    }
  )
})
