import {UserInteractions} from '../../../postgres/pg'
import {UserInteractionResolvers} from '../resolverTypes'

export interface UserInteractionSource extends Omit<UserInteractions, 'id' | 'createdAt'> {
  id: number
  createdAt: Date
}

const UserInteraction: UserInteractionResolvers = {
  receiver: (source, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(source.receivedById)
  },
  sender: (source, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(source.createdById)
  }
}

export default UserInteraction
