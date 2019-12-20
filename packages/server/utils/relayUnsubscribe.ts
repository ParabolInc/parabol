import {ConnectedSubs} from '../socketHelpers/ConnectionContext'

const relayUnsubscribe = (subs: ConnectedSubs | undefined, opId: string) => {
  if (subs) {
    subs[opId]?.return!()
    delete subs[opId]
  }
}

export default relayUnsubscribe
