import {NotifyKudosReceivedResolvers} from '../resolverTypes'

const NotifyKudosReceived: NotifyKudosReceivedResolvers = {
  __isTypeOf: ({type}) => type === 'KUDOS_RECEIVED'
}

export default NotifyKudosReceived
