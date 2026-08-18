import LinearIssueId from '../../shared/gqlIds/LinearIssueId'
import {Providers} from '../../types/constEnums'
import LinearClientManager from '../../utils/LinearClientManager'
import type {ClientIntegrationDefinition} from '../platform/ClientIntegrationDefinition'

const linear: ClientIntegrationDefinition = {
  service: 'linear',
  label: Providers.LINEAR_NAME,
  description: Providers.LINEAR_DESC,
  ids: {
    joinIssue: (parts) => LinearIssueId.join(String(parts.repoId), String(parts.issueId)),
    splitIssue: (id) => LinearIssueId.split(id)
  },
  connect: {
    open: (atmosphere, {teamId, mutationProps, provider}) => {
      if (!provider) return
      void LinearClientManager.openOAuth(
        atmosphere,
        teamId,
        {id: provider.id, clientId: provider.clientId, serverBaseUrl: provider.serverBaseUrl},
        mutationProps
      )
    }
  }
}

export default linear
