import {Providers} from '../../types/constEnums'
import type {IntegrationMeta} from './IntegrationMeta'

export const azureDevOpsIntegrationMeta = {
  service: 'azureDevOps',
  title: Providers.AZUREDEVOPS_NAME,
  description: Providers.AZUREDEVOPS_DESC
} satisfies IntegrationMeta
