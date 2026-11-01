import type {IntegrationProviderServiceEnum} from '../../../__generated__/CreateTaskIntegrationMutation.graphql'
import type {IntegrationCapabilityEnum} from '../../../__generated__/useInspirationSourceAvailability_teamMember.graphql'
import {compareClientIntegrationPopularity} from '../../../integrations/platform/registry'
import {type InspirationSourceService, isInspirationIntegration} from './inspirationSources'

export interface InspirationSourceAvailability {
  service: InspirationSourceService
  isConnected: boolean
}

interface ServiceState {
  service: IntegrationProviderServiceEnum
  isAvailable: boolean
  isConnected: boolean
  capabilities: readonly IntegrationCapabilityEnum[]
}

const PARABOL_SOURCE: InspirationSourceAvailability = {service: 'PARABOL', isConnected: true}

const listInspirationSources = (
  services: readonly ServiceState[] | null | undefined
): InspirationSourceAvailability[] => {
  const integrations = (services ?? [])
    .filter(({isAvailable, capabilities}) => isAvailable && capabilities.includes('issueList'))
    .flatMap(({service, isConnected}) =>
      isInspirationIntegration(service) ? [{service, isConnected}] : []
    )
    .sort((a, b) => compareClientIntegrationPopularity(a.service, b.service))
  return [PARABOL_SOURCE, ...integrations]
}

export default listInspirationSources
