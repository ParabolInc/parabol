import {NotifyKudosReceivedResolvers} from '../resolverTypes'

const NotifyKudosReceived: NotifyKudosReceivedResolvers = {
  __isTypeOf: ({type}) => type === 'KUDOS_RECEIVED',
  emojiUnicode: ({emojiUnicode}) => emojiUnicode ?? '❤️',
  picture: async ({picture}, _args, {dataLoader}) => {
    if (!picture) return null
    return dataLoader.get('fileStoreAsset').load(picture)
  }
}

export default NotifyKudosReceived
