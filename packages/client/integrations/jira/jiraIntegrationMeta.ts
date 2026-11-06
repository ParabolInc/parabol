import type {IntegrationMeta} from '../../shared/integrations/IntegrationMeta'
import {Providers} from '../../types/constEnums'

export const jiraIntegrationMeta = {
  service: 'jira',
  title: Providers.JIRA_CLOUD_NAME,
  description: Providers.JIRA_CLOUD_DESC
} satisfies IntegrationMeta
