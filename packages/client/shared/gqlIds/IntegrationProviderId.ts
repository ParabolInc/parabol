export type IntegrationProviderIdT = string

const IntegrationProviderId = {
  join: (integrationProviderId: number): IntegrationProviderIdT =>
    `integrationProvider:${integrationProviderId}`,
  split: (id: IntegrationProviderIdT) => parseInt(id.split(':')[1])
}

export default IntegrationProviderId
