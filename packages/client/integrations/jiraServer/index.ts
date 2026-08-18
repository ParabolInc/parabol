import JiraServerIssueId from '../../shared/gqlIds/JiraServerIssueId'
import {Providers} from '../../types/constEnums'
import JiraServerClientManager from '../../utils/JiraServerClientManager'
import type {ClientIntegrationDefinition} from '../platform/ClientIntegrationDefinition'

const jiraServer: ClientIntegrationDefinition = {
  service: 'jiraServer',
  label: Providers.JIRA_SERVER_NAME,
  description: Providers.JIRA_SERVER_DESC,
  ids: {
    joinIssue: (parts) =>
      JiraServerIssueId.join(
        Number(parts.providerId),
        String(parts.repositoryId),
        String(parts.issueId)
      ),
    splitIssue: (id) => JiraServerIssueId.split(id)
  },
  connect: {
    open: (atmosphere, {teamId, mutationProps, provider}) => {
      if (!provider) return
      JiraServerClientManager.openOAuth(atmosphere, provider.id, teamId, mutationProps)
    }
  }
}

export default jiraServer
