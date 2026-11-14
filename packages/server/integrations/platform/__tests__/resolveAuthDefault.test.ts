jest.mock('../../../graphql/public/rootSchema', () => ({
  __esModule: true,
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn(),
  default: {}
}))

import {serverIntegrations} from '../registry'
import type {IntegrationCtx} from '../ServerIntegrationDefinition'

const makeCtx = (row: {accessToken: string | null} | null) => {
  const load = jest.fn().mockResolvedValue(row)
  const ctx: IntegrationCtx = {
    teamId: 'team1',
    userId: 'user1',
    dataLoader: {
      get: jest.fn((loaderName: string) => {
        if (loaderName === 'freshAuth') return {load}
        throw new Error(`Unexpected loader ${loaderName}`)
      })
    } as unknown as IntegrationCtx['dataLoader']
  }
  return {ctx, load}
}

describe('resolveAuth default', () => {
  const defaulted = ['gitlab', 'linear', 'jiraServer'] as const

  defaulted.forEach((service) => {
    it(`${service} loads freshAuth keyed by its own service`, async () => {
      const {ctx, load} = makeCtx({accessToken: 'token'})
      await expect(serverIntegrations[service].resolveAuth(ctx)).resolves.toEqual({
        accessToken: 'token'
      })
      expect(load).toHaveBeenCalledWith({service, teamId: 'team1', userId: 'user1'})
    })

    it(`${service} is null for a row without an access token`, async () => {
      const {ctx} = makeCtx({accessToken: null})
      await expect(serverIntegrations[service].resolveAuth(ctx)).resolves.toBeNull()
    })
  })
})
