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
import {GitHubServerIntegration} from '../GitHubServerIntegration'

const makeCtx = (scopes: string) => {
  const rowLoad = jest.fn().mockResolvedValue({accessToken: 'tok', scopes})
  return {
    teamId: 't1',
    userId: 'u1',
    context: {} as GQLContext,
    info: {} as GraphQLResolveInfo,
    dataLoader: {
      get: (name: string) => {
        if (name === 'teamMemberIntegrationAuthsByServiceTeamAndUserId') return {load: rowLoad}
        throw new Error(`Unexpected loader ${name}`)
      }
    }
  } as unknown as GqlIntegrationCtx
}

const github = new GitHubServerIntegration()

test('a grant made before read:org was required does not count as connected', async () => {
  const ctx = makeCtx('repo')
  await expect(github.getAuthRow(ctx)).resolves.toBeNull()
  await expect(github.isConnected(ctx)).resolves.toBe(false)
})

test('a grant with the current scopes counts as connected', async () => {
  const ctx = makeCtx('read:org,repo')
  await expect(github.getAuthRow(ctx)).resolves.toMatchObject({accessToken: 'tok'})
  await expect(github.isConnected(ctx)).resolves.toBe(true)
})
