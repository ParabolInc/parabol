import SuggestedAction from './SuggestedAction'

interface Input {
  id?: string
  createdAt?: Date
  removedAt?: Date | null
  userId: string
}
export default class SuggestedActionTryTheDemo extends SuggestedAction {
  constructor(input: Input) {
    super({...input, type: 'tryTheDemo', priority: 1})
  }
}
