import {SuggestedActionTypeEnum} from 'parabol-client/types/graphql'
import SuggestedAction from './SuggestedAction'

interface Input {
  id?: string
  createdAt?: Date
  removedAt?: Date | null
  userId: string
}
export default class SuggestedActionTryTheDemo extends SuggestedAction {
  constructor(input: Input) {
    super({...input, type: SuggestedActionTypeEnum.tryTheDemo, priority: 1})
  }
}
