import SuggestedAction from './SuggestedAction'

interface Input {
  id?: string
  createdAt?: Date
  removedAt?: Date | null
  userId: string
}
export default class SuggestedActionCreateNewTeam extends SuggestedAction {
  constructor(input: Input) {
    super({...input, type: 'createNewTeam', priority: 4})
  }
}
