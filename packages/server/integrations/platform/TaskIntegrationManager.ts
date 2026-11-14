import type {GraphQLResolveInfo} from 'graphql'
import type {TipTapSerializedContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import type {GQLContext} from '../../graphql/graphql'
import type {IssueRef} from './ServerIntegrationDefinition'

export type CreateTaskResponse = (IssueRef & {issueId: string}) | Error

export interface CreateTaskParams {
  title: string
  /** null when the title says it all, so the issue is created without a description */
  bodyContent: TipTapSerializedContent | null
  integrationRepoId: string
  context?: GQLContext
  info?: GraphQLResolveInfo
}

export interface TaskIntegrationManager {
  title: string

  createTask(params: CreateTaskParams): Promise<CreateTaskResponse>

  addCreatedBySomeoneElseComment(
    viewerName: string,
    assigneeName: string,
    teamName: string,
    teamDashboardUrl: string,
    issueId: string,
    integrationHash?: string
  ): Promise<string | Error>
}
