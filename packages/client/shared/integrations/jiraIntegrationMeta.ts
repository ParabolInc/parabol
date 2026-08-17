import {Providers} from '../../types/constEnums'
import JiraIssueId from '../gqlIds/JiraIssueId'
import type {IntegrationMeta} from './IntegrationMeta'

export const jiraIntegrationMeta = {
  service: 'jira',
  title: Providers.JIRA_CLOUD_NAME,
  description: Providers.JIRA_CLOUD_DESC,
  ids: {
    joinIssue: (parts) => JiraIssueId.join(String(parts.cloudId), String(parts.issueKey)),
    splitIssue: (id) => JiraIssueId.split(id)
  }
} satisfies IntegrationMeta
