import shortid from 'shortid'
import dndNoise from '../../../client/utils/dndNoise'
import getTagsFromEntityMap from '../../../client/utils/draftjs/getTagsFromEntityMap'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import TaskIntegrationJira from './TaskIntegrationJira'
import TaskIntegrationGitHub from './TaskIntegrationGitHub'

export type TaskStatus = 'active' | 'stuck' | 'done' | 'future'
export type TaskTag = 'private' | 'archived'

export interface TaskInput {
  id?: string
  agendaId?: string | null
  content: string
  createdAt?: Date | null
  createdBy: string
  doneMeetingId?: string
  dueDate?: Date | null
  meetingId?: string | null
  reflectionGroupId?: string | null
  sortOrder?: number | null
  status: TaskStatus
  teamId: string
  updatedAt?: Date
  userId: string
}

export default class Task {
  id: string
  agendaId?: string
  assigneeId: string
  content: string
  createdAt: Date
  createdBy: string
  doneMeetingId?: string
  dueDate?: Date | null
  integration?: TaskIntegrationJira | TaskIntegrationGitHub
  meetingId?: string
  reflectionGroupId?: string
  sortOrder: number
  status: TaskStatus
  tags: TaskTag[]
  teamId: string
  updatedAt: Date
  userId: string

  constructor(input: TaskInput) {
    const {
      id,
      userId,
      meetingId,
      teamId,
      agendaId,
      content,
      createdAt,
      createdBy,
      doneMeetingId,
      dueDate,
      reflectionGroupId,
      sortOrder,
      status,
      updatedAt
    } = input
    const {entityMap} = JSON.parse(content)
    const tags = getTagsFromEntityMap<TaskTag>(entityMap)
    this.id = id || shortid.generate()
    this.agendaId = agendaId || undefined
    this.assigneeId = toTeamMemberId(teamId, userId)
    this.content = content
    this.createdAt = createdAt || new Date()
    this.createdBy = createdBy
    this.doneMeetingId = doneMeetingId
    this.dueDate = dueDate || undefined
    this.meetingId = meetingId || undefined
    this.reflectionGroupId = reflectionGroupId || undefined
    this.sortOrder = sortOrder || dndNoise()
    this.status = status
    this.tags = tags
    this.teamId = teamId
    this.updatedAt = updatedAt || new Date()
    this.userId = userId
  }
}
