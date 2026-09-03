import type {GraphQLResolveInfo} from 'graphql'
import type {IntegrationMeta} from 'parabol-client/shared/integrations/IntegrationMeta'
import type {DataLoaderWorker, GQLContext, InternalContext} from '../../graphql/graphql'
import type {TaskEstimateInput} from '../../graphql/public/resolverTypes'
import type {Task, TeamMemberIntegrationAuth} from '../../postgres/types'
import type {EstimatePushResult} from '../../postgres/types/EstimatePushResult'
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
  /** Validates a client-supplied search before it is stored as IntegrationSearchQuery.query; services with issueSearch offer stored searches back as recents */
  buildQuery(queryString: string, meta: JsonObject): TQuery | Error
}

/** The dataloaders reach the repo fetchers with a bare RootDataLoader, the capabilities with the request's worker */
export type RepoFetchCtx = Omit<IntegrationCtx, 'dataLoader'> & {
  dataLoader: Pick<DataLoaderWorker, 'get'>
}

export interface RepoListCapability {
  /** Every repo/project the viewer can create issues in, in the exact object shape the client and the prev-used Redis cache already store. An Error is the remote failure and must never be cached */
  fetchRepos(ctx: GqlIntegrationCtx): Promise<RemoteRepoIntegration[] | Error>
}

export interface EstimatePushCtx extends GqlIntegrationCtx {
  task: Task
  taskEstimate: TaskEstimateInput
  stageId: string
  viewerId: string
  meetingName: string
  discussionURL: string
}

export interface DimensionFieldCtx extends GqlIntegrationCtx {
  task: Task
  viewerId: string
}

/** Which stored mapping applies to a task: the repo/project it lives in and, for services whose fields vary by issue type, that type */
export interface DimensionFieldKey {
  repoId: string
  issueType: string | null
  /** Field ids the current issue can accept. When set, stored rows for other fields are ignored and a row saved for another issue type may be reused; when absent only an exact issue type match counts */
  usableFieldIds?: string[]
}

export interface DimensionFieldTarget {
  fieldId: string
  /** The service's human-readable name for fieldId; null when fieldId is already the label (templates, sentinels, Azure DevOps ids) */
  fieldName: string | null
  fieldType: string
}

export interface ServiceField {
  name: string
  type: string
}

export type EstimatePushTarget = 'comment' | 'field' | 'label'

export interface DimensionFieldOption {
  fieldId: string
  label: string
}

export interface DimensionFieldListing {
  options: DimensionFieldOption[]
  helpUrl?: string
}

export interface EstimatePushCapability {
  targets: EstimatePushTarget[]
  /** An Error is the user-visible failure message; analytics and the TaskEstimate insert read the result */
  pushEstimate(ctx: EstimatePushCtx): Promise<EstimatePushResult | Error>
  /** The mapping key for this task; null when the issue or auth cannot be resolved */
  resolveDimensionFieldKey(ctx: DimensionFieldCtx): Promise<DimensionFieldKey | null>
  /** Turns a chosen field id into the row to store. Sentinels never reach this, and updateIntegrationDimensionField has already checked the id against listDimensionFields for field services */
  describeDimensionField(
    ctx: DimensionFieldCtx,
    key: DimensionFieldKey,
    fieldId: string
  ): Promise<DimensionFieldTarget | Error>
  /** The fields a facilitator can map this dimension to on this task. Label services return no options — the client offers the editable template instead. helpUrl explains an empty list when the service knows why */
  listDimensionFields(ctx: DimensionFieldCtx): Promise<DimensionFieldListing>
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

  /** The viewer's active auth row for this team as stored — never refreshed, so it is safe to read on any surface. Services whose grant may not cover them override this */
  async getAuthRow(ctx: IntegrationCtx): Promise<TeamMemberIntegrationAuth | null> {
    const {dataLoader, teamId, userId} = ctx
    const auth = await dataLoader
      .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
      .load({service: this.service, teamId, userId})
    return auth?.accessToken ? auth : null
  }

  /** A cheap DB-row check. Never refreshes tokens — resolveAuth does that at time of use. */
  async isConnected(ctx: IntegrationCtx) {
    return !!(await this.getAuthRow(ctx))
  }

  protected async hasSharedProvider(ctx: IntegrationCtx) {
    const {dataLoader, teamId} = ctx
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    const providers = await dataLoader
      .get('sharedIntegrationProviders')
      .load({service: this.service, orgIds: [team.orgId], teamIds: [teamId]})
    return providers.length > 0
  }

  /** The team- and org-scoped provider rows for this team, which connect flows prefer over the global row */
  async getSharedProviders(ctx: IntegrationCtx): Promise<TIntegrationProvider[]> {
    const {dataLoader, teamId} = ctx
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    const providers = await dataLoader
      .get('sharedIntegrationProviders')
      .load({service: this.service, orgIds: [team.orgId], teamIds: [teamId]})
    return providers.filter(({scope}) => scope !== 'global')
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
