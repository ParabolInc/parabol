import type {GraphQLResolveInfo} from 'graphql'
import type {IntegrationMeta} from 'parabol-client/shared/integrations/IntegrationMeta'
import type {DataLoaderWorker, GQLContext, InternalContext} from '../../graphql/graphql'
import type {TaskEstimateInput} from '../../graphql/public/resolverTypes'
import type {Task, TeamMemberIntegrationAuth} from '../../postgres/types'
import type {TIntegrationProvider} from '../../postgres/types/IntegrationProvider'
import type {JsonObject} from '../../postgres/types/pg'
import type {RemoteRepoIntegration} from './RemoteRepoIntegration'
import type {TaskIntegrationManager} from './TaskIntegrationManager'

export interface IntegrationCtx {
  dataLoader: DataLoaderWorker
  teamId: string
  userId: string
}

export interface GqlIntegrationCtx extends IntegrationCtx {
  context: GQLContext
  info: GraphQLResolveInfo
}

export interface IssueCreateCapability {
  initManager(ctx: GqlIntegrationCtx): Promise<TaskIntegrationManager | null>
}

export interface IssueReadCtx extends IntegrationCtx {
  context: InternalContext
  info: GraphQLResolveInfo
  task: Task
  viewerId: string
  /** Selection spliced into the vendor query by services proxied through a nested schema; '...info' forwards the client's */
  fieldsToFetch: string
}

export interface IssueReadCapability {
  /** The raw issue payload in the shape the service's TaskIntegration GraphQL type resolves — never re-wrapped, so __typename/discriminant keys survive */
  getIssue(ctx: IssueReadCtx): Promise<unknown>
}

export interface IssueSearchCapability<TQuery extends JsonObject = JsonObject> {
  /** Validates a client-supplied search before it is stored as IntegrationSearchQuery.query */
  buildQuery(queryString: string, meta: JsonObject): TQuery | Error
}

export interface RepoListCapability {
  /** Every repo/project the viewer can create issues in, in the exact object shape the client and the prev-used Redis cache already store */
  fetchRepos(ctx: GqlIntegrationCtx): Promise<RemoteRepoIntegration[]>
}

export interface EstimatePushCtx extends GqlIntegrationCtx {
  task: Task
  taskEstimate: TaskEstimateInput
  stageId: string
  viewerId: string
  meetingName: string
  discussionURL: string
}

/** Provenance columns written to TaskEstimate; a service sets at most one */
export interface EstimatePushResult {
  jiraFieldId?: string
  githubLabelName?: string
  gitlabLabelId?: string
}

export interface ServiceFieldCtx extends GqlIntegrationCtx {
  task: Task
  dimensionName: string
  viewerId: string
}

export interface ServiceField {
  name: string
  type: string
}

export interface EstimatePushCapability {
  targets: Array<'comment' | 'field' | 'label'>
  /** An Error is the user-visible failure message; analytics and the TaskEstimate insert read the result */
  pushEstimate(ctx: EstimatePushCtx): Promise<EstimatePushResult | Error>
  /** The field an estimate lands in for this task's dimension; null when the issue or auth cannot be resolved */
  resolveServiceField(ctx: ServiceFieldCtx): Promise<ServiceField | null>
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
  /** The viewer's usable auth row for this team, refreshed first when the service supports it */
  async resolveAuth(ctx: IntegrationCtx): Promise<TeamMemberIntegrationAuth | null> {
    const {dataLoader, teamId, userId} = ctx
    const auth = await dataLoader.get('freshAuth').load({service: this.service, teamId, userId})
    return auth?.accessToken ? auth : null
  }

  /** A team, org, or global provider row exists. Services whose connect flow needs the global row override this */
  async isAvailable(ctx: IntegrationCtx) {
    return this.hasSharedProvider(ctx)
  }

  /** A cheap DB-row check. Never refreshes tokens — resolveAuth does that at time of use. */
  async isConnected(ctx: IntegrationCtx) {
    return this.hasActiveAuthRow(ctx)
  }

  protected async hasActiveAuthRow(ctx: IntegrationCtx) {
    const {dataLoader, teamId, userId} = ctx
    const auth = await dataLoader
      .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
      .load({service: this.service, teamId, userId})
    return !!auth?.accessToken
  }

  protected async hasSharedProvider(ctx: IntegrationCtx) {
    const {dataLoader, teamId} = ctx
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    const providers = await dataLoader
      .get('sharedIntegrationProviders')
      .load({service: this.service, orgIds: [team.orgId], teamIds: [teamId]})
    return providers.length > 0
  }

  /** The instance-wide (cloud) provider row, the only one some connect flows can use */
  async getGlobalProvider(ctx: IntegrationCtx): Promise<TIntegrationProvider | null> {
    const [globalProvider] = await ctx.dataLoader
      .get('sharedIntegrationProviders')
      .load({service: this.service, orgIds: [], teamIds: []})
    return globalProvider ?? null
  }

  getCapabilityKeys() {
    const keys = Object.keys(this.capabilities) as IntegrationCapabilityKey[]
    return keys.filter((key) => this.capabilities[key] !== undefined)
  }
}
