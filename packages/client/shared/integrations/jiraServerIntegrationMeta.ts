import {Providers} from '../../types/constEnums'
import type {IntegrationMeta} from './IntegrationMeta'

export const jiraServerIntegrationMeta = {
  service: 'jiraServer',
  title: Providers.JIRA_SERVER_NAME,
  description: Providers.JIRA_SERVER_DESC
} satisfies IntegrationMeta
