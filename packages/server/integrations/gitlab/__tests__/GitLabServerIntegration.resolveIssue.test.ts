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
import {GitLabServerIntegration} from '../GitLabServerIntegration'

const makeCtx = (auth: {providerId: number; accessToken: string} | null) =>
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

const gitlab = new GitLabServerIntegration()
const GID = 'gid://gitlab/Issue/123'

test('a node id resolves with the provider id from the viewer auth', async () => {
  expect(await gitlab.resolveIssue(makeCtx({providerId: 7, accessToken: 'tok'}), GID)).toEqual({
    integrationHash: `integrationProvider:7::${GID}`,
    integration: {
      accessUserId: 'u1',
      service: 'gitlab',
      providerId: 'integrationProvider:7',
      gid: GID
    }
  })
})

test('a hash resolves, with the provider id re-derived rather than trusted', async () => {
  const res = await gitlab.resolveIssue(
    makeCtx({providerId: 7, accessToken: 'tok'}),
    `integrationProvider:99::${GID}`
  )
  expect(res?.integration).toMatchObject({providerId: 'integrationProvider:7', gid: GID})
})

test('no auth means null', async () => {
  expect(await gitlab.resolveIssue(makeCtx(null), GID)).toBeNull()
})

test('neither form is rejected', async () => {
  expect(
    await gitlab.resolveIssue(makeCtx({providerId: 7, accessToken: 'tok'}), 'nonsense')
  ).toBeNull()
})

test('a bare gid with trailing garbage is rejected', async () => {
  expect(
    await gitlab.resolveIssue(makeCtx({providerId: 7, accessToken: 'tok'}), `${GID}::junk`)
  ).toBeNull()
})

test('a hash with extra segments is rejected', async () => {
  expect(
    await gitlab.resolveIssue(
      makeCtx({providerId: 7, accessToken: 'tok'}),
      `integrationProvider:7::${GID}::extra`
    )
  ).toBeNull()
})
