import {NotifyKudosReceivedResolvers} from '../resolverTypes'

const NotifyKudosReceived: NotifyKudosReceivedResolvers = {
  __isTypeOf: ({type}) => type === 'KUDOS_RECEIVED',
  emojiUnicode: ({emojiUnicode}) => emojiUnicode ?? '❤️'
}

export default NotifyKudosReceived
