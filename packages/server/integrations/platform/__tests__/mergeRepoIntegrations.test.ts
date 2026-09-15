jest.mock('../../../graphql/public/rootSchema', () => ({
  __esModule: true,
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn(),
  default: {}
}))

import mergeRepoIntegrations from '../mergeRepoIntegrations'
import type {GitHubRepo, GitLabProject} from '../RemoteRepoIntegration'

const github = (nameWithOwner: string): GitHubRepo => ({
  hasIssuesEnabled: true,
  nameWithOwner,
  updatedAt: new Date('2026-01-01'),
  viewerCanAdminister: false,
  service: 'github'
})
const gitlab = (fullPath: string): GitLabProject => ({
  __typename: 'Project',
  id: `gid://gitlab/Project/${fullPath}`,
  fullPath,
  service: 'gitlab'
})

test('puts previously used repos first, then round-robins the services without repeating them', () => {
  expect(
    mergeRepoIntegrations(
      [gitlab('acme/web')],
      [
        [github('acme/api'), github('acme/cli')],
        [gitlab('acme/web'), gitlab('acme/ops')]
      ]
    )
  ).toEqual([gitlab('acme/web'), github('acme/api'), github('acme/cli'), gitlab('acme/ops')])
})

test('keeps same-named repos from different services', () => {
  expect(mergeRepoIntegrations([], [[github('acme/api')], [gitlab('acme/api')]])).toEqual([
    github('acme/api'),
    gitlab('acme/api')
  ])
})

test('is empty with nothing to merge', () => {
  expect(mergeRepoIntegrations([], [[], []])).toEqual([])
})
