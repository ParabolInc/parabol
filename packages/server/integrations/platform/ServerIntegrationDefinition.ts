import type {GraphQLResolveInfo} from 'graphql'
import type {DataLoaderWorker, GQLContext} from '../../graphql/graphql'
import type {
  IntegrationProviderServiceEnumType,
  TaskIntegrationManager
} from '../TaskIntegrationManagerFactory'

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

export interface WorkItemsCapability {
  getUserWorkItems(ctx: GqlIntegrationCtx): Promise<unknown[]>
}

export interface ServerIntegrationCapabilities {
  issueCreate?: IssueCreateCapability
  issueRead?: IssueReadCapability
  issueSearch?: IssueSearchCapability
  repoList?: RepoListCapability
  estimatePush?: EstimatePushCapability
  workItems?: WorkItemsCapability
}

export type IntegrationCapabilityKey = keyof ServerIntegrationCapabilities

export interface ServerIntegrationDefinition {
  service: IntegrationProviderServiceEnumType
  title: string
  authStrategy: 'oauth1' | 'oauth2' | 'pat' | 'webhook'
  resolveAuth(ctx: IntegrationCtx): Promise<IntegrationAuth | null>
  capabilities: ServerIntegrationCapabilities
}
