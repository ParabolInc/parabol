import {KudosResolvers} from '../resolverTypes'

const Kudos: KudosResolvers = {
  receiverUser: async ({receiverUserId}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(receiverUserId)
  },
  senderUser: async ({senderUserId}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(senderUserId)
  }
}

export default Kudos
