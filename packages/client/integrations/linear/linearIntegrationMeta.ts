import type {IntegrationMeta} from '../../shared/integrations/IntegrationMeta'
import {Providers} from '../../types/constEnums'

export const linearIntegrationMeta = {
  service: 'linear',
  title: Providers.LINEAR_NAME,
  description: Providers.LINEAR_DESC
} satisfies IntegrationMeta
