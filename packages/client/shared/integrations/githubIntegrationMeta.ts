import {Providers} from '../../types/constEnums'
import type {IntegrationMeta} from './IntegrationMeta'

export const githubIntegrationMeta = {
  service: 'github',
  title: Providers.GITHUB_NAME,
  description: Providers.GITHUB_DESC
} satisfies IntegrationMeta
