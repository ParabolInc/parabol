import {Providers} from '../../types/constEnums'
import type {IntegrationMeta} from './IntegrationMeta'

export const jiraIntegrationMeta = {
  service: 'jira',
  title: Providers.JIRA_CLOUD_NAME,
  description: Providers.JIRA_CLOUD_DESC
} satisfies IntegrationMeta
