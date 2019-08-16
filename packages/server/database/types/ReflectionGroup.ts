import shortid from 'shortid'

interface Input {
  id?: string
  createdAt?: Date
  meetingId: string
  retroPhaseItemId: string
  sortOrder: number
  updatedAt?: Date
  voterIds?: string[]
}

export default class ReflectionGroup {
  id: string
  createdAt: Date
  isActive: boolean
  meetingId: string
  retroPhaseItemId: string
  sortOrder: number
  updatedAt: Date
  voterIds: string[]
  constructor(input: Input) {
    const {createdAt, id, meetingId, retroPhaseItemId, sortOrder, updatedAt, voterIds} = input
    const now = new Date()
    this.id = id || shortid.generate()
    this.createdAt = createdAt || now
    this.isActive = true
    this.meetingId = meetingId
    this.retroPhaseItemId = retroPhaseItemId
    this.sortOrder = sortOrder
    this.updatedAt = updatedAt || now
    this.voterIds = voterIds || []
  }
}
