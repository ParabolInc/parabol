import {NotifyKickedOutResolvers} from '../resolverTypes'

const NotifyKickedOut: NotifyKickedOutResolvers = {
  __isTypeOf: ({type}) => type === 'KICKED_OUT',
  evictor: async ({evictorUserId}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(evictorUserId)
  },

  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default NotifyKickedOut
