import type {ServiceEnum} from '../../../__generated__/useGenerateInspirationItemsMutation.graphql'
import {getClientIntegration} from '../../../integrations/platform/registry'

const inspirationServiceLabel = (service: ServiceEnum) => {
  if (service === 'PARABOL') return 'Parabol'
  return getClientIntegration(service)?.title ?? service
}

export default inspirationServiceLabel
