import shortid from 'shortid'
import {TimelineEventEnum} from 'parabol-client/types/graphql'

// export type ScheduledJobType = 'MEETING_STAGE_TIME_LIMIT_END'

interface Input {
  id?: string
  createdAt?: Date
  interactionCount?: number
  seenCount?: number
  type: TimelineEventEnum
  userId: string
}

export default abstract class TimelineEvent {
  id: string
  createdAt: Date
  interactionCount: number
  seenCount: number
  type: TimelineEventEnum
  userId: string
  protected constructor(input: Input) {
    const {createdAt, id, userId, type, interactionCount, seenCount} = input
    this.id = id || shortid.generate()
    this.createdAt = createdAt || new Date()
    this.userId = userId
    this.type = type
    this.interactionCount = interactionCount || 0
    this.seenCount = seenCount || 0
  }
}
