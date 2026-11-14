import type {IntegrationProviderServiceEnum} from '../../../__generated__/CreateTaskIntegrationMutation.graphql'
import findIntegrationService, {getConnectProvider} from '../findIntegrationService'

const services: readonly {
  service: IntegrationProviderServiceEnum
  cloudProvider: {
    id: string
    clientId: string
    serverBaseUrl: string
    tenantId: string | null
  } | null
}[] = [
  {
    service: 'jira',
    cloudProvider: {
      id: 'p1',
      clientId: 'c1',
      serverBaseUrl: 'https://atlassian.com',
      tenantId: null
    }
  },
  {service: 'jiraServer', cloudProvider: null}
]

describe('findIntegrationService helpers', () => {
  it('finds by service key', () => {
    expect(findIntegrationService(services, 'jiraServer')?.service).toBe('jiraServer')
    expect(findIntegrationService(services, 'github')).toBeUndefined()
  })

  it('getConnectProvider requires an OAuth2 cloud provider', () => {
    expect(getConnectProvider(services, 'jira')?.id).toBe('p1')
    expect(getConnectProvider(services, 'jiraServer')).toBeNull()
  })
})
