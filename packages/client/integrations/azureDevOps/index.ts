import AzureDevOpsIssueId from '../../shared/gqlIds/AzureDevOpsIssueId'
import {Providers} from '../../types/constEnums'
import AzureDevOpsClientManager from '../../utils/AzureDevOpsClientManager'
import type {ClientIntegrationDefinition} from '../platform/ClientIntegrationDefinition'

const azureDevOps: ClientIntegrationDefinition = {
  service: 'azureDevOps',
  label: Providers.AZUREDEVOPS_NAME,
  description: Providers.AZUREDEVOPS_DESC,
  ids: {
    joinIssue: (parts) =>
      AzureDevOpsIssueId.join(
        String(parts.instanceId),
        String(parts.projectKey),
        String(parts.issueKey)
      ),
    splitIssue: (id) => AzureDevOpsIssueId.split(id)
  },
  connect: {
    open: (atmosphere, {teamId, mutationProps, provider}) => {
      if (!provider) return
      void AzureDevOpsClientManager.openOAuth(
        atmosphere,
        teamId,
        {id: provider.id, tenantId: provider.tenantId, clientId: provider.clientId},
        mutationProps
      )
    }
  }
}

export default azureDevOps
