import JiraIssueId from '../../shared/gqlIds/JiraIssueId'
import {Providers} from '../../types/constEnums'
import AtlassianClientManager from '../../utils/AtlassianClientManager'
import type {ClientIntegrationDefinition} from '../platform/ClientIntegrationDefinition'

const jira: ClientIntegrationDefinition = {
  service: 'jira',
  label: Providers.ATLASSIAN_NAME,
  description: Providers.ATLASSIAN_DESC,
  ids: {
    joinIssue: (parts) => JiraIssueId.join(String(parts.cloudId), String(parts.issueKey)),
    splitIssue: (id) => JiraIssueId.split(id)
  },
  connect: {
    open: (atmosphere, {teamId, mutationProps}) =>
      AtlassianClientManager.openOAuth(atmosphere, teamId, mutationProps)
  }
}

export default jira
