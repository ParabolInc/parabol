import {Providers} from '../../types/constEnums'
import JiraServerIssueId from '../gqlIds/JiraServerIssueId'
import type {IntegrationMeta} from './IntegrationMeta'

export const jiraServerIntegrationMeta = {
  service: 'jiraServer',
  title: Providers.JIRA_SERVER_NAME,
  description: Providers.JIRA_SERVER_DESC,
  ids: {
    joinIssue: (parts) =>
      JiraServerIssueId.join(
        Number(parts.providerId),
        String(parts.repositoryId),
        String(parts.issueId)
      ),
    splitIssue: (id) => JiraServerIssueId.split(id)
  }
} satisfies IntegrationMeta
