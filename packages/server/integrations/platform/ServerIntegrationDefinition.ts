import type {GraphQLResolveInfo} from 'graphql'
import type {IntegrationMeta} from 'parabol-client/shared/integrations/IntegrationMeta'
import type {DataLoaderWorker, GQLContext} from '../../graphql/graphql'
import type {Integrationproviderserviceenum} from '../../postgres/types/pg'
import type {TaskIntegrationManager} from '../TaskIntegrationManagerFactory'

export interface IntegrationCtx {
  dataLoader: DataLoaderWorker
  teamId: string
  userId: string
}

export interface GqlIntegrationCtx extends IntegrationCtx {
  context: GQLContext
  info: GraphQLResolveInfo
}

export interface IntegrationAuth {
  accessToken: string
  accessUserId: string
  providerId: number | null
  raw: unknown
}

export interface IssueCreateCapability {
  initManager(ctx: GqlIntegrationCtx): Promise<TaskIntegrationManager | null>
}

export interface IssueReadCapability {
  getIssue(ctx: GqlIntegrationCtx, issueId: string): Promise<unknown>
}

export interface IssueSearchCapability {
  persistQueries: boolean
}

export interface RepoListCapability {
  fetchRepos(ctx: GqlIntegrationCtx): Promise<unknown[]>
}

export interface EstimatePushCapability {
  targets: Array<'comment' | 'field' | 'label'>
}

export interface IssueListCapability {
  getViewerIssues(ctx: GqlIntegrationCtx): Promise<unknown[]>
}

export interface ServerIntegrationCapabilities {
  issueCreate?: IssueCreateCapability
  issueRead?: IssueReadCapability
  issueSearch?: IssueSearchCapability
  issueList?: IssueListCapability
  repoList?: RepoListCapability
  estimatePush?: EstimatePushCapability
}

export type IntegrationCapabilityKey = keyof ServerIntegrationCapabilities

export abstract class ServerIntegrationDefinition {
  abstract readonly service: IntegrationMeta['service']
  abstract readonly title: string
  abstract readonly authStrategy: 'oauth1' | 'oauth2' | 'pat' | 'webhook'
  abstract readonly capabilities: ServerIntegrationCapabilities
  abstract resolveAuth(ctx: IntegrationCtx): Promise<IntegrationAuth | null>
  abstract isAvailable(ctx: IntegrationCtx): Promise<boolean>
  /** A cheap DB-row check. Never refreshes tokens — resolveAuth does that at time of use. */
  abstract isConnected(ctx: IntegrationCtx): Promise<boolean>

  protected async hasActiveAuthRow(ctx: IntegrationCtx, service: Integrationproviderserviceenum) {
    const {dataLoader, teamId, userId} = ctx
    const auth = await dataLoader
      .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
      .load({service, teamId, userId})
    return !!auth?.accessToken
  }

  private async loadSharedProviders(ctx: IntegrationCtx, service: Integrationproviderserviceenum) {
    const {dataLoader, teamId} = ctx
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    return dataLoader
      .get('sharedIntegrationProviders')
      .load({service, orgIds: [team.orgId], teamIds: [teamId]})
  }

  protected async hasSharedProvider(ctx: IntegrationCtx, service: Integrationproviderserviceenum) {
    const providers = await this.loadSharedProviders(ctx, service)
    return providers.length > 0
  }

  // jira/github clients never send a providerId, so only a global provider is reachable until P4
  protected async hasGlobalProvider(ctx: IntegrationCtx, service: Integrationproviderserviceenum) {
    const providers = await this.loadSharedProviders(ctx, service)
    return providers.some((provider) => provider.scope === 'global')
  }

  getCapabilityKeys() {
    const keys = Object.keys(this.capabilities) as IntegrationCapabilityKey[]
    return keys.filter((key) => this.capabilities[key] !== undefined)
  }
}
