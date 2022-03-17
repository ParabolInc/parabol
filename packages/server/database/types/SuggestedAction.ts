import generateUID from '../../generateUID'
import {TSuggestedActionTypeEnum} from '../../graphql/types/SuggestedActionTypeEnum'

interface Input {
  id?: string
  createdAt?: Date
  priority: number
  removedAt?: Date | null
  type: TSuggestedActionTypeEnum
  userId: string
}

export default abstract class SuggestedAction {
  id: string
  createdAt: Date
  priority: number
  removedAt: Date | null
  type: TSuggestedActionTypeEnum
  userId: string

  protected constructor(input: Input) {
    const {type, userId, id, createdAt, priority, removedAt} = input
    this.id = id || generateUID()
    this.createdAt = createdAt || new Date()
    this.userId = userId
    this.type = type
    this.priority = priority
    this.removedAt = removedAt || null
  }
}
