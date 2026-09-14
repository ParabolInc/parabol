jest.mock('../../../graphql/public/rootSchema', () => ({
  __esModule: true,
  default: {},
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn()
}))

import type {GraphQLResolveInfo} from 'graphql'
import type {GQLContext} from '../../../graphql/graphql'
import type {GqlIntegrationCtx} from '../../platform/ServerIntegrationDefinition'
import {LinearServerIntegration} from '../LinearServerIntegration'
import LinearServerManager from '../LinearServerManager'

const makeCtx = (auth: {accessToken: string} | null) =>
  ({
    teamId: 't1',
    userId: 'u1',
    context: {} as GQLContext,
    info: {} as GraphQLResolveInfo,
    dataLoader: {
      get: (name: string) => {
        if (name === 'freshAuth') return {load: jest.fn().mockResolvedValue(auth)}
        throw new Error(`Unexpected loader ${name}`)
      }
    }
  }) as unknown as GqlIntegrationCtx

const linear = new LinearServerIntegration()
const ISSUE = 'c4a4c7e2-1111-4c2e-9b5a-000000000001'

afterEach(() => {
  jest.restoreAllMocks()
})

test('a node id is looked up to build repoId from team and project', async () => {
  const getIssue = jest
    .spyOn(LinearServerManager.prototype, 'getIssue')
    .mockResolvedValue([
      {issue: {id: ISSUE, identifier: 'PAR-1', project: {id: 'proj1'}, team: {id: 'team1'}}},
      null
    ] as never)
  expect(await linear.resolveIssue(makeCtx({accessToken: 'tok'}), ISSUE)).toEqual({
    integrationHash: `team1:proj1::${ISSUE}`,
    integration: {accessUserId: 'u1', service: 'linear', repoId: 'team1:proj1', issueId: ISSUE}
  })
  expect(getIssue).toHaveBeenCalledWith({id: ISSUE})
})

test('an issue with no project keys its repoId on the team alone', async () => {
  jest
    .spyOn(LinearServerManager.prototype, 'getIssue')
    .mockResolvedValue([
      {issue: {id: ISSUE, identifier: 'PAR-1', project: null, team: {id: 'team1'}}},
      null
    ] as never)
  const res = await linear.resolveIssue(makeCtx({accessToken: 'tok'}), ISSUE)
  expect(res?.integration).toMatchObject({repoId: 'team1'})
})

test('a hash resolves without a vendor call', async () => {
  const getIssue = jest.spyOn(LinearServerManager.prototype, 'getIssue')
  const res = await linear.resolveIssue(makeCtx({accessToken: 'tok'}), `team1:proj1::${ISSUE}`)
  expect(getIssue).not.toHaveBeenCalled()
  expect(res?.integrationHash).toBe(`team1:proj1::${ISSUE}`)
})

test('a vendor error resolves to null', async () => {
  jest
    .spyOn(LinearServerManager.prototype, 'getIssue')
    .mockResolvedValue([undefined, new Error('boom')] as never)
  expect(await linear.resolveIssue(makeCtx({accessToken: 'tok'}), ISSUE)).toBeNull()
})
