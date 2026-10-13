import {Providers} from '../../types/constEnums'
import type {IntegrationMeta} from './IntegrationMeta'

export const gcalIntegrationMeta = {
  service: 'gcal',
  title: Providers.GCAL_NAME,
  description: Providers.GCAL_DESC
} satisfies IntegrationMeta
