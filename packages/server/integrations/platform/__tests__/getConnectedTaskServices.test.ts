import getConnectedTaskServices from '../getConnectedTaskServices'
import type {IntegrationCtx} from '../ServerIntegrationDefinition'

jest.mock('../registry', () => ({
  serverIntegrations: {
    gitlab: {service: 'gitlab', resolveAuth: jest.fn().mockResolvedValue({accessToken: 't'})},
    linear: {service: 'linear', resolveAuth: jest.fn().mockResolvedValue(null)},
    jira: {service: 'jira', resolveAuth: jest.fn().mockResolvedValue({accessToken: 'j'})}
  }
}))

describe('getConnectedTaskServices', () => {
  it('lists the services whose resolveAuth yields a usable row', async () => {
    const ctx = {dataLoader: {}, teamId: 't1', userId: 'u1'} as IntegrationCtx
    await expect(getConnectedTaskServices(ctx)).resolves.toEqual(['gitlab', 'jira'])
  })
})
