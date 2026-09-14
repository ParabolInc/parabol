jest.mock('../../../public/rootSchema', () => ({
  __esModule: true,
  default: {},
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn()
}))

import type {GraphQLResolveInfo} from 'graphql'
import type {GqlIntegrationCtx} from '../../../../integrations/platform/ServerIntegrationDefinition'
import type {GQLContext} from '../../../graphql'
import resolveScopeAdds from '../resolveScopeAdds'

const ctx = {
  teamId: 't1',
  userId: 'u1',
  context: {} as GQLContext,
  info: {} as GraphQLResolveInfo,
  dataLoader: {get: jest.fn()}
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
