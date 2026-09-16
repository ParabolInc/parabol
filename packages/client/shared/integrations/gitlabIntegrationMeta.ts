import {Providers} from '../../types/constEnums'
import type {IntegrationMeta} from './IntegrationMeta'

export const gitlabIntegrationMeta = {
  service: 'gitlab',
  title: Providers.GITLAB_NAME,
  description: 'Use GitLab Issues from within Parabol.'
} satisfies IntegrationMeta
