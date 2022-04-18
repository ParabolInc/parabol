import dndNoise from 'parabol-client/utils/dndNoise'
import extractTextFromDraftString from 'parabol-client/utils/draftjs/extractTextFromDraftString'
import getTagsFromEntityMap from 'parabol-client/utils/draftjs/getTagsFromEntityMap'
import generateUID from '../../generateUID'
import TaskIntegrationGitHub from './TaskIntegrationGitHub'
import TaskIntegrationGitLab from './TaskIntegrationGitLab'
import TaskIntegrationJira from './TaskIntegrationJira'
import TaskIntegrationJiraServer from './TaskIntegrationJiraServer'

export type AreaEnum = 'meeting' | 'teamDash' | 'userDash'
export type TaskStatusEnum = 'active' | 'stuck' | 'done' | 'future'
export type TaskTagEnum = 'private' | 'archived'
export type TaskServiceEnum =
  | 'PARABOL'
  | 'github'
  | 'jira'
  | 'jiraServer'
  | 'gitlab'
  | 'azureDevOps'

export type TaskIntegration =
  | TaskIntegrationJira
  | TaskIntegrationGitHub
  | TaskIntegrationJiraServer
  | TaskIntegrationGitLab
export interface TaskInput {
  id?: string
  content: string
  createdAt?: Date | null
  createdBy: string
  doneMeetingId?: string
  dueDate?: Date | null
  integration?: TaskIntegration

  integrationHash?: string
  meetingId?: string | null
  plaintextContent?: string
  sortOrder?: number | null
  status: TaskStatusEnum
  teamId: string
  discussionId?: string | null
  threadParentId?: string | null
  threadSortOrder?: number | null
  updatedAt?: Date
  userId?: string | null
}

export default class Task {
  id: string
  content: string
  createdAt: Date
  createdBy: string
  doneMeetingId?: string
  dueDate?: Date | null
  integration?: TaskIntegration
  integrationHash?: string
  meetingId?: string
  plaintextContent: string
  sortOrder: number
  status: TaskStatusEnum
  tags: TaskTagEnum[]
  teamId: string
  discussionId?: string
  threadParentId?: string
  threadSortOrder?: number | null
  updatedAt: Date
  userId: string | null

  constructor(input: TaskInput) {
    const {
      id,
      userId,
      meetingId,
      teamId,
      content,
      createdAt,
      createdBy,
      doneMeetingId,
      dueDate,
      integration,
      integrationHash,
      plaintextContent,
      sortOrder,
      status,
      threadParentId,
      threadSortOrder,
      discussionId,
      updatedAt
    } = input
    const {entityMap} = JSON.parse(content)
    const tags = getTagsFromEntityMap<TaskTagEnum>(entityMap)
    this.id = id || generateUID()
    this.discussionId = discussionId || undefined
    this.content = content
    this.createdAt = createdAt || new Date()
    this.createdBy = createdBy
    this.doneMeetingId = doneMeetingId
    this.dueDate = dueDate || undefined
    this.integration = integration || undefined
    this.integrationHash = integrationHash
    this.meetingId = meetingId || undefined
    this.plaintextContent = plaintextContent || extractTextFromDraftString(content)
    this.sortOrder = sortOrder || dndNoise()
    this.status = status
    this.tags = tags
    this.teamId = teamId
    this.threadSortOrder = threadSortOrder || undefined
    this.threadParentId = threadParentId || undefined
    this.updatedAt = updatedAt || new Date()
    this.userId = userId || null
  }
}
