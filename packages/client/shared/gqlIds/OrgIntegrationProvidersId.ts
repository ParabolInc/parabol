const OrgIntegrationProvidersId = {
  join: (orgId: string) => `orgIntegrationProviders:${orgId}`,
  split: (id: string) => id.split(':')[1]!
}

export default OrgIntegrationProvidersId
