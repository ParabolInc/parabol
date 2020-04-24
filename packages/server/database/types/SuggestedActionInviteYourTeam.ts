import {SuggestedActionTypeEnum} from 'parabol-client/types/graphql'
import SuggestedAction from './SuggestedAction'

interface Input {
  id?: string
  createdAt?: Date
  removedAt?: Date | null
  userId: string
  teamId: string
}
export default class SuggestedActionInviteYourTeam extends SuggestedAction {
  teamId: string
  constructor(input: Input) {
    super({...input, type: SuggestedActionTypeEnum.inviteYourTeam, priority: 2})
    const {teamId} = input
    this.teamId = teamId
  }
}
