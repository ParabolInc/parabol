import UserInteractionId from 'parabol-client/shared/gqlIds/UserInteractionId'
import {UserInteractions} from '../../../postgres/pg'
import {UserInteractionResolvers} from '../resolverTypes'

export interface UserInteractionSource extends Omit<UserInteractions, 'id' | 'createdAt'> {
  id: number
  teamId: string
  createdAt: Date
}

const UserInteraction: UserInteractionResolvers = {
  id: ({id, teamId}) => UserInteractionId.join(teamId, id),
  receiver: (source, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(source.receivedById)
  },
  sender: (source, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(source.createdById)
  }
}

export default UserInteraction
