jest.mock('../../../public/rootSchema', () => ({
  __esModule: true,
  default: {},
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn()
}))
jest.mock('../../../../utils/logError', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../../../../integrations/jira/hasAtlassianSiteAccess', () => ({
  __esModule: true,
  default: jest.fn(async (_auth: unknown, cloudId: string) => cloudId === 'cloud1')
}))

import type {GraphQLResolveInfo} from 'graphql'
import type {GqlIntegrationCtx} from '../../../../integrations/platform/ServerIntegrationDefinition'
import logError from '../../../../utils/logError'
import type {GQLContext} from '../../../graphql'
import resolveScopeAdds from '../resolveScopeAdds'

const ctx = {
  teamId: 't1',
  userId: 'u1',
  context: {} as GQLContext,
  info: {} as GraphQLResolveInfo,
  dataLoader: {
    get: (name: string) => {
      if (name === 'freshAtlassianAuth') {
        return {
          load: jest.fn().mockResolvedValue({
            service: 'jira',
            accessToken: 'tok',
            scope: 'read:jira-user read:jira-work write:jira-work',
            cloudIds: ['cloud1']
          })
        }
      }
      throw new Error(`Unexpected loader ${name}`)
    }
  }
} as unknown as GqlIntegrationCtx

test('PARABOL adds pass through with no integration', async () => {
  expect(
    await resolveScopeAdds([{service: 'PARABOL', serviceTaskId: 'task1', action: 'ADD'}], ctx)
  ).toEqual([{service: 'PARABOL', serviceTaskId: 'task1', action: 'ADD', integration: null}])
})

test('integrated adds carry the hash as serviceTaskId and the stored parts', async () => {
  expect(
    await resolveScopeAdds([{service: 'jira', serviceTaskId: 'cloud1:WEB-12', action: 'ADD'}], ctx)
  ).toEqual([
    {
      service: 'jira',
      serviceTaskId: 'cloud1:WEB-12',
      action: 'ADD',
      integration: {
        accessUserId: 'u1',
        service: 'jira',
        cloudId: 'cloud1',
        issueKey: 'WEB-12',
        projectKey: 'WEB'
      }
    }
  ])
})

test('an unresolvable id is an Error naming the service', async () => {
  const res = await resolveScopeAdds([{service: 'jira', serviceTaskId: 'nope', action: 'ADD'}], ctx)
  expect(res).toBeInstanceOf(Error)
  expect((res as Error).message).toContain('Jira')
  expect(logError).toHaveBeenCalledTimes(1)
})

test('one unresolvable id does not drop the adds that resolve', async () => {
  const res = await resolveScopeAdds(
    [
      {service: 'jira', serviceTaskId: 'nope', action: 'ADD'},
      {service: 'PARABOL', serviceTaskId: 'task1', action: 'ADD'}
    ],
    ctx
  )
  expect(res).toEqual([
    {service: 'PARABOL', serviceTaskId: 'task1', action: 'ADD', integration: null}
  ])
})

test('an empty list resolves to an empty list', async () => {
  expect(await resolveScopeAdds([], ctx)).toEqual([])
})

test('two adds that resolve to the same hash collapse to one', async () => {
  const res = await resolveScopeAdds(
    [
      {service: 'jira', serviceTaskId: 'cloud1:WEB-12', action: 'ADD'},
      {service: 'jira', serviceTaskId: 'cloud1:WEB-12', action: 'ADD'}
    ],
    ctx
  )
  expect(res).toHaveLength(1)
  expect((res as {serviceTaskId: string}[])[0]!.serviceTaskId).toBe('cloud1:WEB-12')
})

test('a partial failure logs the dropped add and keeps the resolved one', async () => {
  const res = await resolveScopeAdds(
    [
      {service: 'jira', serviceTaskId: 'other:WEB-1', action: 'ADD'},
      {service: 'PARABOL', serviceTaskId: 'task1', action: 'ADD'}
    ],
    ctx
  )
  expect(res).toEqual([
    {service: 'PARABOL', serviceTaskId: 'task1', action: 'ADD', integration: null}
  ])
  expect(logError).toHaveBeenCalledTimes(1)
  expect(logError).toHaveBeenCalledWith(
    expect.objectContaining({
      message: expect.stringContaining('other:WEB-1')
    }),
    {tags: {service: 'jira', teamId: 't1'}, userId: 'u1'}
  )
})
