import type {IntegrationMeta} from '../../shared/integrations/IntegrationMeta'
import {Providers} from '../../types/constEnums'

export const jiraServerIntegrationMeta = {
  service: 'jiraServer',
  title: Providers.JIRA_SERVER_NAME,
  description: Providers.JIRA_SERVER_DESC
} satisfies IntegrationMeta
