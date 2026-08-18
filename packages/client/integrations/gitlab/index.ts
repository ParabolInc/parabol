import GitLabIssueId from '../../shared/gqlIds/GitLabIssueId'
import {Providers} from '../../types/constEnums'
import GitLabClientManager from '../../utils/GitLabClientManager'
import type {ClientIntegrationDefinition} from '../platform/ClientIntegrationDefinition'

const gitlab: ClientIntegrationDefinition = {
  service: 'gitlab',
  label: Providers.GITLAB_NAME,
  description: 'Use GitLab Issues from within Parabol.',
  ids: {
    joinIssue: (parts) => GitLabIssueId.join(String(parts.providerId), String(parts.gid)),
    splitIssue: (id) => GitLabIssueId.split(id)
  },
  connect: {
    open: (atmosphere, {teamId, mutationProps, provider}) => {
      if (!provider) return
      GitLabClientManager.openOAuth(
        atmosphere,
        provider.id,
        provider.clientId,
        provider.serverBaseUrl,
        teamId,
        mutationProps
      )
    }
  }
}

export default gitlab
