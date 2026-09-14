jest.mock('../../../graphql/public/rootSchema', () => ({
  __esModule: true,
  default: {},
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn()
}))

import type {GraphQLResolveInfo} from 'graphql'
import type {GQLContext} from '../../../graphql/graphql'
import {githubRequest} from '../../../graphql/public/rootSchema'
import type {GqlIntegrationCtx} from '../../platform/ServerIntegrationDefinition'
import {GitHubServerIntegration} from '../GitHubServerIntegration'

const makeCtx = (auth: {accessToken: string} | null) =>
  ({
    teamId: 't1',
    userId: 'u1',
    context: {} as GQLContext,
    info: {} as GraphQLResolveInfo,
    dataLoader: {
      get: (name: string) => {
        if (name === 'githubAuth') return {load: jest.fn().mockResolvedValue(auth)}
        throw new Error(`Unexpected loader ${name}`)
      }
    }
  }) as unknown as GqlIntegrationCtx

const github = new GitHubServerIntegration()
const mockedRequest = githubRequest as jest.Mock

afterEach(() => {
  jest.clearAllMocks()
})

test('a node id is looked up for repo and number', async () => {
  mockedRequest.mockResolvedValue({
    data: {node: {number: 12, repository: {nameWithOwner: 'ParabolInc/parabol'}}}
  })
  expect(await github.resolveIssue(makeCtx({accessToken: 'tok'}), 'I_kwDOABCD')).toEqual({
    integrationHash: 'ParabolInc/parabol:12',
    integration: {
      accessUserId: 'u1',
      service: 'github',
      nameWithOwner: 'ParabolInc/parabol',
      issueNumber: 12
    }
  })
  expect(mockedRequest.mock.calls[0]![0].variables).toEqual({id: 'I_kwDOABCD'})
})

test('a hash resolves without a vendor call', async () => {
  const res = await github.resolveIssue(makeCtx({accessToken: 'tok'}), 'ParabolInc/parabol:12')
  expect(mockedRequest).not.toHaveBeenCalled()
  expect(res?.integration).toMatchObject({nameWithOwner: 'ParabolInc/parabol', issueNumber: 12})
})

test('a node that is not an Issue resolves to null', async () => {
  mockedRequest.mockResolvedValue({data: {node: {}}})
  expect(await github.resolveIssue(makeCtx({accessToken: 'tok'}), 'PR_kwDO')).toBeNull()
})

test('no auth resolves to null', async () => {
  expect(await github.resolveIssue(makeCtx(null), 'I_kwDOABCD')).toBeNull()
})
