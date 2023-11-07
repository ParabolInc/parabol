import * as amplitude from '@amplitude/analytics-browser'
import {Identify} from '@amplitude/analytics-browser'
const safeIdentify = (userId: string, email: string) => {
  const identity = new Identify()
  identity.set('email', email)
  amplitude.identify(identity, {
    user_id: userId
  })
}

export default safeIdentify
