import findIntegrationService, {
  getConnectProvider,
  isServiceAvailable
} from '../findIntegrationService'

const services: readonly {
  service: string
  isAvailable: boolean
  cloudProvider: {
    id: string
    clientId: string
    serverBaseUrl: string
    tenantId: string | null
  } | null
}[] = [
  {
    service: 'jira',
    isAvailable: true,
    cloudProvider: {
      id: 'p1',
      clientId: 'c1',
      serverBaseUrl: 'https://atlassian.com',
      tenantId: null
    }
  },
  {service: 'jiraServer', isAvailable: true, cloudProvider: null},
  {service: 'linear', isAvailable: false, cloudProvider: null}
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

  it('isServiceAvailable reads the server flag and is false for unknown services', () => {
    expect(isServiceAvailable(services, 'jira')).toBe(true)
    expect(isServiceAvailable(services, 'linear')).toBe(false)
    expect(isServiceAvailable(services, 'github')).toBe(false)
  })
})
