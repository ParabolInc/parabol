import {Providers} from '../../types/constEnums'
import AzureDevOpsIssueId from '../gqlIds/AzureDevOpsIssueId'
import type {IntegrationMeta} from './IntegrationMeta'

export const azureDevOpsIntegrationMeta = {
  service: 'azureDevOps',
  title: Providers.AZUREDEVOPS_NAME,
  description: Providers.AZUREDEVOPS_DESC,
  ids: {
    joinIssue: (parts) =>
      AzureDevOpsIssueId.join(
        String(parts.instanceId),
        String(parts.projectKey),
        String(parts.issueKey)
      ),
    splitIssue: (id) => AzureDevOpsIssueId.split(id)
  }
} satisfies IntegrationMeta
