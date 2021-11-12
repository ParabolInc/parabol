export type IntegrationProviderIdT = string

const IntegrationProviderId = {
  join: (providerId: number): IntegrationProviderIdT => `integrationProvider:${providerId}`,
  split: (id: IntegrationProviderIdT) => parseInt(id.split(':')[1])
}

export default IntegrationProviderId
