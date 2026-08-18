import type {
  IntegrationCapabilityKey,
  ServerIntegrationDefinition
} from './ServerIntegrationDefinition'

export const deriveCapabilityKeys = (
  def: ServerIntegrationDefinition
): IntegrationCapabilityKey[] => {
  const keys = Object.keys(def.capabilities) as IntegrationCapabilityKey[]
  return keys.filter((key) => def.capabilities[key] !== undefined)
}
