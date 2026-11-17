import type {IntegrationProviderServiceEnum} from '../../../__generated__/CreateTaskIntegrationMutation.graphql'
import {listClientIntegrationServices} from '../../../integrations/platform/registry'
import {type InspirationSourceService, isInspirationIntegration} from './inspirationSources'

export interface InspirationSourceAvailability {
  service: InspirationSourceService
  isConnected: boolean
}

interface ServiceState {
  service: IntegrationProviderServiceEnum
  isAvailable: boolean
  isConnected: boolean
}

const PARABOL_SOURCE: InspirationSourceAvailability = {service: 'PARABOL', isConnected: true}

const listInspirationSources = (
  services: readonly ServiceState[] | null | undefined
): InspirationSourceAvailability[] => {
  const integrations = listClientIntegrationServices(services ?? []).flatMap(
    ({integrationService: {service, isAvailable, isConnected}}) =>
      isAvailable && isInspirationIntegration(service) ? [{service, isConnected}] : []
  )
  return [PARABOL_SOURCE, ...integrations]
}

export default listInspirationSources
