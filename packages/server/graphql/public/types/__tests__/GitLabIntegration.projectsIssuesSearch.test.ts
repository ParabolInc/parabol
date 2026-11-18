import type {GraphQLResolveInfo} from 'graphql'
import {GitLabRateLimitError} from '../../../../integrations/gitlab/GitLabServerManager'
import type {GetProjectIssuesQueryVariables} from '../../../../types/gitlabTypes'
import logError from '../../../../utils/logError'
import type {GQLContext} from '../../../graphql'
import GitLabIntegration from '../GitLabIntegration'

const projects = [
  {fullPath: 'acme/web/app', group: {fullPath: 'acme/web'}},
  {fullPath: 'acme/api', group: {fullPath: 'acme'}},
  {fullPath: 'beta/site', group: {fullPath: 'beta'}},
  {fullPath: 'beta/docs', group: {fullPath: 'beta'}},
  {fullPath: 'alice/notes', group: null}
]
const requests: {kind: 'group' | 'project'; fullPath: string; after?: string | null}[] = []
let groupIssuesError: Error | null = null

const issuesPage = (fullPath: string) => ({
  fullPath,
  issues: {
    edges: [{cursor: 'c1', node: {id: `gid://gitlab/Issue/${fullPath}`}}],
    pageInfo: {hasNextPage: true, endCursor: 'c1'}
  }
})

jest.mock('../../../../integrations/gitlab/GitLabServerManager', () => ({
  __esModule: true,
  GitLabRateLimitError: class extends Error {},
  default: class {
    async getProjects({ids}: {ids: string[] | null}) {
      const chosen = ids ? projects.filter(({fullPath}) => ids.includes(fullPath)) : projects
      return [{projects: {edges: chosen.map((node) => ({node}))}}, null]
    }
    async getGroupIssues({fullPath, after}: GetProjectIssuesQueryVariables) {
      requests.push({kind: 'group', fullPath, after})
      if (groupIssuesError) return [null, groupIssuesError]
      return [{group: issuesPage(fullPath)}, null]
    }
    async getProjectIssues({fullPath, after}: GetProjectIssuesQueryVariables) {
      requests.push({kind: 'project', fullPath, after})
      return [{project: issuesPage(fullPath)}, null]
    }
  }
}))
jest.mock('../../../../utils/logError')

const dataLoader = {
  get: (name: string) => ({
    load: async () =>
      name === 'integrationProviders'
        ? {serverBaseUrl: 'https://gitlab.example.com'}
        : {accessToken: 'token', providerId: 1}
  })
}
const context = {dataLoader} as unknown as GQLContext
const source = {teamId: 'team1', userId: 'user1'}

const resolve = GitLabIntegration.projectsIssues
if (typeof resolve !== 'function') throw new Error('resolver must be a function')

const run = (args: {searchQuery: string; after?: string; projectsIds?: string[]}) =>
  resolve(
    source,
    {first: 25, sort: 'UPDATED_DESC', state: 'opened', ...args},
    context,
    {} as GraphQLResolveInfo
  )

describe('GitLabIntegration.projectsIssues', () => {
  beforeEach(() => {
    requests.length = 0
    groupIssuesError = null
  })

  it('searches each outermost group once and only projects outside a group one by one', async () => {
    const connection = await run({searchQuery: 'bug'})
    expect(requests).toEqual([
      {kind: 'group', fullPath: 'acme', after: ''},
      {kind: 'group', fullPath: 'beta', after: ''},
      {kind: 'project', fullPath: 'alice/notes', after: ''}
    ])
    expect(connection.edges).toHaveLength(3)
    expect(JSON.parse(connection.pageInfo.endCursor!)).toEqual([
      {fullPath: 'acme', cursor: 'c1'},
      {fullPath: 'beta', cursor: 'c1'},
      {fullPath: 'alice/notes', cursor: 'c1'}
    ])
  })

  it('lists issues project by project when nothing is searched', async () => {
    await run({searchQuery: ''})
    expect(requests).toEqual(projects.map(({fullPath}) => ({kind: 'project', fullPath, after: ''})))
  })

  it('searches only the projects chosen as filters', async () => {
    await run({searchQuery: 'bug', projectsIds: ['beta/docs', 'alice/notes']})
    expect(requests).toEqual([
      {kind: 'project', fullPath: 'beta/docs', after: ''},
      {kind: 'project', fullPath: 'alice/notes', after: ''}
    ])
  })

  it('asks for the next page only where there are more issues', async () => {
    const after = JSON.stringify([{fullPath: 'beta', cursor: 'c1'}])
    await run({searchQuery: 'bug', after})
    expect(requests).toEqual([{kind: 'group', fullPath: 'beta', after: 'c1'}])
  })

  it("passes GitLab's rate limit on to the viewer without logging it as an error", async () => {
    groupIssuesError = new GitLabRateLimitError('GitLab rate limit reached, try again in a minute')
    const connection = await run({searchQuery: 'bug'})
    expect(logError).not.toHaveBeenCalled()
    expect(connection.error).toEqual({message: 'GitLab rate limit reached, try again in a minute'})
    expect(connection.edges).toHaveLength(1)
  })
})
