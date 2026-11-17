import ClickUpTaskId from 'parabol-client/integrations/clickup/shared/ClickUpTaskId'

const parseClickUpIntegrationHash = (integrationHash: string) => {
  const ids = ClickUpTaskId.split(integrationHash)
  return ids ? {service: 'clickup' as const, ...ids} : null
}

export default parseClickUpIntegrationHash
