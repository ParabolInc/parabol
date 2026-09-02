import type {JSONContent} from '@tiptap/core'
import type {GraphQLResolveInfo} from 'graphql'
import type {GQLContext} from '../../graphql/graphql'
import type {Task} from '../../postgres/types'

export type CreateTaskResponse =
  | {
      integrationHash: string
      issueId: string
      integration: NonNullable<Task['integration']>
    }
  | Error

export interface TaskIntegrationManager {
  title: string

  createTask(params: {
    rawContentJSON: JSONContent
    integrationRepoId: string
    context?: GQLContext
    info?: GraphQLResolveInfo
  }): Promise<CreateTaskResponse>

  addCreatedBySomeoneElseComment(
    viewerName: string,
    assigneeName: string,
    teamName: string,
    teamDashboardUrl: string,
    issueId: string,
    integrationHash?: string
  ): Promise<string | Error>
}
