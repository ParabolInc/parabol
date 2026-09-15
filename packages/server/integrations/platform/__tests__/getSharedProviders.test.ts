jest.mock('../../../graphql/public/rootSchema', () => ({
  __esModule: true,
  default: {},
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn()
}))

import type {GraphQLResolveInfo} from 'graphql'
import type {GQLContext} from '../../../graphql/graphql'
import {GitHubServerIntegration} from '../../github/GitHubServerIntegration'
import type {GqlIntegrationCtx} from '../ServerIntegrationDefinition'

const rows = [
  {id: 'global', scope: 'global'},
  {id: 'org', scope: 'org'},
  {id: 'team', scope: 'team'}
]

const makeCtx = () => {
  const load = jest.fn().mockResolvedValue(rows)
  const ctx = {
    teamId: 't1',
    userId: 'u1',
    context: {} as GQLContext,
    info: {} as GraphQLResolveInfo,
    dataLoader: {
      get: (name: string) => {
        if (name === 'teams') return {loadNonNull: async () => ({orgId: 'o1'})}
        if (name === 'sharedIntegrationProviders') return {load}
        throw new Error(`Unexpected loader ${name}`)
      }
    }
  } as unknown as GqlIntegrationCtx
  return {ctx, load}
}

test('getSharedProviders returns the team and org rows for the viewer team and never the global row', async () => {
  const {ctx, load} = makeCtx()
  const providers = await new GitHubServerIntegration().getSharedProviders(ctx)
  expect(providers.map(({id}) => id)).toEqual(['org', 'team'])
  expect(load).toHaveBeenCalledWith({service: 'github', orgIds: ['o1'], teamIds: ['t1']})
})
