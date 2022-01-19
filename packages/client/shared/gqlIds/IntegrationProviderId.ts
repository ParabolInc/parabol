const IntegrationProviderId = {
  join: (providerId: number) => `integrationProvider:${providerId}`,
  split: (id: string) => parseInt(id.split(':')[1])
}

export default IntegrationProviderId
