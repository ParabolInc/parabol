import shortid from 'shortid'

export interface AgendaItemInput {
  id?: string
  createdAt?: Date
  isActive?: boolean
  isComplete?: boolean
  sortOrder?: number
  teamId: string
  teamMemberId: string
  updatedAt?: Date
  content: string
  meetingId?: string
}

export default class AgendaItem {
  id: string
  content: string
  createdAt: Date
  isActive: boolean
  isComplete: boolean
  sortOrder: number
  teamId: string
  teamMemberId: string
  updatedAt: Date
  meetingId?: string

  constructor(input: AgendaItemInput) {
    const {
      id,
      createdAt,
      isActive,
      isComplete,
      sortOrder,
      teamId,
      teamMemberId,
      updatedAt,
      content,
      meetingId
    } = input
    const now = new Date()
    this.id = id || shortid.generate()
    this.createdAt = createdAt || now
    this.isActive = isActive ?? true
    this.isComplete = isComplete ?? false
    this.sortOrder = sortOrder || 0
    this.teamId = teamId
    this.teamMemberId = teamMemberId
    this.updatedAt = updatedAt || now
    this.content = content || ''
    this.meetingId = meetingId
  }
}
