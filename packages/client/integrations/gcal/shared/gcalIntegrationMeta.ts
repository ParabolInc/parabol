import type {IntegrationMeta} from '../../../shared/integrations/IntegrationMeta'
import {Providers} from '../../../types/constEnums'

export const gcalIntegrationMeta = {
  service: 'gcal',
  title: Providers.GCAL_NAME,
  description: Providers.GCAL_DESC
} satisfies IntegrationMeta
