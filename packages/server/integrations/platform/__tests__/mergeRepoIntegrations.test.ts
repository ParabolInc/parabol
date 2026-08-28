import mergeRepoIntegrations from '../mergeRepoIntegrations'
import type {GitHubRepo, GitLabProject} from '../RemoteRepoIntegration'

const github = (nameWithOwner: string): GitHubRepo => ({
  id: nameWithOwner,
  service: 'github',
  nameWithOwner
})
const gitlab = (fullPath: string): GitLabProject => ({
  id: fullPath,
  service: 'gitlab',
  __typename: 'Project',
  fullPath
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
