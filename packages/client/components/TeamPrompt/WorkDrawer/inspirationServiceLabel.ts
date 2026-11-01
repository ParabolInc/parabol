import type {ServiceEnum} from '../../../__generated__/useGenerateInspirationItemsMutation.graphql'
import {
  getClientIntegration,
  isRegisteredClientIntegration
} from '../../../integrations/platform/registry'

const inspirationServiceLabel = (service: ServiceEnum) => {
  if (service === 'PARABOL') return 'Parabol'
  return isRegisteredClientIntegration(service) ? getClientIntegration(service).title : service
}

export default inspirationServiceLabel
