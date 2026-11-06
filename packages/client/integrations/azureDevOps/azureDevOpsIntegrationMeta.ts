import type {IntegrationMeta} from '../../shared/integrations/IntegrationMeta'
import {Providers} from '../../types/constEnums'

export const azureDevOpsIntegrationMeta = {
  service: 'azureDevOps',
  title: Providers.AZUREDEVOPS_NAME,
  description: Providers.AZUREDEVOPS_DESC
} satisfies IntegrationMeta
