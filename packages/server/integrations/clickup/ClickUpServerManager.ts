import ClickUpTaskId from 'parabol-client/integrations/clickup/shared/ClickUpTaskId'
import {clickupIntegrationMeta} from 'parabol-client/integrations/clickup/shared/clickupIntegrationMeta'
import {tipTapToMarkdown} from 'parabol-client/shared/tiptap/tipTapToMarkdown'
import type {TeamMemberIntegrationAuth} from '../../postgres/types'
import type {
  CreateTaskParams,
  CreateTaskResponse,
  TaskIntegrationManager
} from '../platform/TaskIntegrationManager'
import type {ClickUpApiTask} from './ClickUpApiTypes'
import clickUpRequest from './clickUpRequest'
import makeCreateClickUpTaskComment from './makeCreateClickUpTaskComment'

const LIST_ID = /^\d+$/

export default class ClickUpServerManager implements TaskIntegrationManager {
  readonly title = clickupIntegrationMeta.title
  readonly auth: TeamMemberIntegrationAuth

  constructor(auth: TeamMemberIntegrationAuth) {
    this.auth = auth
  }

  async createTask({
    title,
    bodyContent,
    integrationRepoId
  }: CreateTaskParams): Promise<CreateTaskResponse> {
    if (!LIST_ID.test(integrationRepoId)) {
      return new Error(`Invalid ClickUp list: ${integrationRepoId}`)
    }
    const task = await clickUpRequest<Partial<ClickUpApiTask>>(
      this.auth,
      `/list/${encodeURIComponent(integrationRepoId)}/task`,
      {
        method: 'POST',
        body: {
          name: title,
          markdown_content: bodyContent ? tipTapToMarkdown(bodyContent) : undefined
        }
      }
    )
    if (task instanceof Error) return task
    const integrationHash = ClickUpTaskId.join(task.team_id ?? '', task.id ?? '')
    const ids = ClickUpTaskId.split(integrationHash)
    if (!ids) return new Error('ClickUp did not return the id of the new task')
    return {
      integrationHash,
      issueId: ids.taskId,
      integration: {service: 'clickup', accessUserId: this.auth.userId, ...ids}
    }
  }

  async addCreatedBySomeoneElseComment(
    viewerName: string,
    assigneeName: string,
    teamName: string,
    teamDashboardUrl: string,
    issueId: string,
    integrationHash?: string
  ): Promise<string | Error> {
    const comment = await clickUpRequest<{id: string}>(
      this.auth,
      `/task/${encodeURIComponent(issueId)}/comment`,
      {
        method: 'POST',
        body: {
          comment_text: makeCreateClickUpTaskComment(
            viewerName,
            assigneeName,
            teamName,
            teamDashboardUrl
          ),
          notify_all: false
        },
        workspaceId: ClickUpTaskId.split(integrationHash ?? '')?.workspaceId
      }
    )
    return comment instanceof Error ? comment : comment.id
  }
}
