import AzureDevOpsIssueId from 'parabol-client/shared/gqlIds/AzureDevOpsIssueId'
import IntegrationRepoId from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import {azureDevOpsIntegrationMeta} from 'parabol-client/shared/integrations/azureDevOpsIntegrationMeta'
import type {AzureDevOpsSearchQueryJson, TeamMemberIntegrationAuth} from '../../postgres/types'
import {
  type EstimatePushCapability,
  type IntegrationCtx,
  type IssueCreateCapability,
  type IssueReadCapability,
  type IssueSearchCapability,
  type RepoAccessCapability,
  type RepoListCapability,
  ServerIntegrationDefinition
} from '../platform/ServerIntegrationDefinition'
import {isAzureDevOpsInstanceId} from './AzureDevOpsServerManager'
import buildAzureDevOpsSearchQuery from './buildAzureDevOpsSearchQuery'
import describeAzureDevOpsDimensionField from './describeAzureDevOpsDimensionField'
import fetchAvailableAzureDevOpsProjects, {
  type AzureDevOpsProject
} from './fetchAvailableAzureDevOpsProjects'
import fetchAzureDevOpsProjects from './fetchAzureDevOpsProjects'
import getAzureDevOpsManager from './getAzureDevOpsManager'
import listAzureDevOpsDimensionFields from './listAzureDevOpsDimensionFields'
import pushEstimateToAzureDevOps from './pushEstimateToAzureDevOps'
import resolveAzureDevOpsDimensionFieldKey from './resolveAzureDevOpsDimensionFieldKey'
import resolveAzureDevOpsTaskIntegration from './resolveAzureDevOpsTaskIntegration'

export class AzureDevOpsServerIntegration extends ServerIntegrationDefinition {
  readonly service = azureDevOpsIntegrationMeta.service
  readonly title = azureDevOpsIntegrationMeta.title
  readonly authStrategy = 'oauth2' as const

  async resolveAuth(ctx: IntegrationCtx): Promise<TeamMemberIntegrationAuth | null> {
    const {dataLoader, teamId, userId} = ctx
    const auth = await dataLoader.get('freshAzureDevOpsAuth').load({teamId, userId})
    return auth?.accessToken ? auth : null
  }

  parseIntegrationHash(integrationHash: string) {
    const {instanceId, projectKey, issueKey} = AzureDevOpsIssueId.split(integrationHash)
    if (
      !projectKey ||
      !/^\d+$/.test(issueKey) ||
      AzureDevOpsIssueId.join(instanceId, projectKey, issueKey) !== integrationHash ||
      !isAzureDevOpsInstanceId(instanceId)
    ) {
      return null
    }
    return {service: 'azureDevOps' as const, instanceId, projectKey, issueKey}
  }

  readonly capabilities: {
    issueCreate: IssueCreateCapability
    issueRead: IssueReadCapability
    issueSearch: IssueSearchCapability<AzureDevOpsSearchQueryJson>
    repoList: RepoListCapability<AzureDevOpsProject>
    repoAccess: RepoAccessCapability<AzureDevOpsProject>
    estimatePush: EstimatePushCapability
  } = {
    issueCreate: {initManager: getAzureDevOpsManager},
    issueRead: {getIssue: resolveAzureDevOpsTaskIntegration},
    issueSearch: {buildQuery: buildAzureDevOpsSearchQuery},
    repoList: {
      fetchRepos: fetchAzureDevOpsProjects,
      integrationRepoId: ({instanceId, projectId}) =>
        IntegrationRepoId.join({service: 'azureDevOps', instanceId, projectId}),
      name: ({name}) => name
    },
    repoAccess: {fetchAvailableRepos: fetchAvailableAzureDevOpsProjects},
    estimatePush: {
      targets: ['comment', 'field'],
      pushEstimate: pushEstimateToAzureDevOps,
      resolveDimensionFieldKey: resolveAzureDevOpsDimensionFieldKey,
      describeDimensionField: describeAzureDevOpsDimensionField,
      listDimensionFields: listAzureDevOpsDimensionFields
    }
  }
}
