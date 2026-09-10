import IntegrationRepoId from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import {azureDevOpsIntegrationMeta} from 'parabol-client/shared/integrations/azureDevOpsIntegrationMeta'
import type {AzureAccountProject} from '../../dataloader/azureDevOpsLoaders'
import type {TeamMemberIntegrationAuth} from '../../postgres/types'
import AzureDevOpsServerManager from '../../utils/AzureDevOpsServerManager'
import {
  type EstimatePushCapability,
  type IntegrationCtx,
  type IssueCreateCapability,
  type IssueReadCapability,
  type RepoListCapability,
  ServerIntegrationDefinition
} from '../platform/ServerIntegrationDefinition'
import describeAzureDevOpsDimensionField from './describeAzureDevOpsDimensionField'
import fetchAzureDevOpsProjects from './fetchAzureDevOpsProjects'
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

  readonly capabilities: {
    issueCreate: IssueCreateCapability
    issueRead: IssueReadCapability
    repoList: RepoListCapability<AzureAccountProject>
    estimatePush: EstimatePushCapability
  } = {
    issueCreate: {
      initManager: async (ctx) => {
        const auth = await this.resolveAuth(ctx)
        if (!auth) return null
        const provider = await ctx.dataLoader
          .get('integrationProviders')
          .loadNonNull(auth.providerId)
        if (provider.service !== 'azureDevOps') return null
        return new AzureDevOpsServerManager(auth, provider)
      }
    },
    issueRead: {getIssue: resolveAzureDevOpsTaskIntegration},
    repoList: {
      fetchRepos: fetchAzureDevOpsProjects,
      integrationRepoId: ({instanceId, projectId}) =>
        IntegrationRepoId.join({service: 'azureDevOps', instanceId, projectId}),
      name: ({name}) => name
    },
    estimatePush: {
      targets: ['comment', 'field'],
      pushEstimate: pushEstimateToAzureDevOps,
      resolveDimensionFieldKey: resolveAzureDevOpsDimensionFieldKey,
      describeDimensionField: describeAzureDevOpsDimensionField,
      listDimensionFields: listAzureDevOpsDimensionFields
    }
  }
}
