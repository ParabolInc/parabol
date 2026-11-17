import type {IntegrationMeta} from '../../../shared/integrations/IntegrationMeta'
import {Providers} from '../../../types/constEnums'

export const githubIntegrationMeta = {
  service: 'github',
  title: Providers.GITHUB_NAME,
  description: Providers.GITHUB_DESC
} satisfies IntegrationMeta
