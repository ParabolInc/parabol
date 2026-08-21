jest.mock('../../TaskIntegrationManagerFactory', () => ({
  __esModule: true,
  default: {initManager: jest.fn()}
}))

import {serverIntegrations} from '../registry'
import type {IntegrationCtx} from '../ServerIntegrationDefinition'

const makeCtx = (providers: unknown[]): IntegrationCtx => ({
  teamId: 'team1',
  userId: 'user1',
  dataLoader: {
    get: jest.fn((loaderName: string) => {
      if (loaderName === 'teams') {
        return {loadNonNull: jest.fn().mockResolvedValue({id: 'team1', orgId: 'org1'})}
      }
      if (loaderName === 'sharedIntegrationProviders') {
        return {load: jest.fn().mockResolvedValue(providers)}
      }
      throw new Error(`Unexpected loader ${loaderName}`)
    })
  } as unknown as IntegrationCtx['dataLoader']
})

describe('isAvailable', () => {
  const providerBacked = ['gitlab', 'linear', 'azureDevOps', 'jiraServer'] as const

  providerBacked.forEach((service) => {
    it(`${service} is available when a provider row exists`, async () => {
      await expect(serverIntegrations[service].isAvailable(makeCtx([{id: 1}]))).resolves.toBe(true)
    })

    it(`${service} is unavailable when no provider row exists`, async () => {
      await expect(serverIntegrations[service].isAvailable(makeCtx([]))).resolves.toBe(false)
    })
  })

  it('jira availability reflects ATLASSIAN_CLIENT_ID', async () => {
    const prev = process.env.ATLASSIAN_CLIENT_ID
    process.env.ATLASSIAN_CLIENT_ID = 'abc'
    await expect(serverIntegrations.jira.isAvailable(makeCtx([]))).resolves.toBe(true)
    delete process.env.ATLASSIAN_CLIENT_ID
    await expect(serverIntegrations.jira.isAvailable(makeCtx([]))).resolves.toBe(false)
    if (prev !== undefined) process.env.ATLASSIAN_CLIENT_ID = prev
  })

  it('github availability reflects GITHUB_CLIENT_ID', async () => {
    const prev = process.env.GITHUB_CLIENT_ID
    process.env.GITHUB_CLIENT_ID = 'abc'
    await expect(serverIntegrations.github.isAvailable(makeCtx([]))).resolves.toBe(true)
    delete process.env.GITHUB_CLIENT_ID
    await expect(serverIntegrations.github.isAvailable(makeCtx([]))).resolves.toBe(false)
    if (prev !== undefined) process.env.GITHUB_CLIENT_ID = prev
  })
})
