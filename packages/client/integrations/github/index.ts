import GitHubIssueId from '../../shared/gqlIds/GitHubIssueId'
import {Providers} from '../../types/constEnums'
import GitHubClientManager from '../../utils/GitHubClientManager'
import type {ClientIntegrationDefinition} from '../platform/ClientIntegrationDefinition'

const github: ClientIntegrationDefinition = {
  service: 'github',
  label: Providers.GITHUB_NAME,
  description: Providers.GITHUB_DESC,
  ids: {
    joinIssue: (parts) =>
      GitHubIssueId.join(String(parts.nameWithOwner), Number(parts.issueNumber)),
    splitIssue: (id) => GitHubIssueId.split(id)
  },
  connect: {
    open: (atmosphere, {teamId, mutationProps}) =>
      GitHubClientManager.openOAuth(atmosphere, teamId, mutationProps)
  }
}

export default github
