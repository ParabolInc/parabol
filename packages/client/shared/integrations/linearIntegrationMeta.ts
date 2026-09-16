import {Providers} from '../../types/constEnums'
import type {IntegrationMeta} from './IntegrationMeta'

export const linearIntegrationMeta = {
  service: 'linear',
  title: Providers.LINEAR_NAME,
  description: Providers.LINEAR_DESC
} satisfies IntegrationMeta
