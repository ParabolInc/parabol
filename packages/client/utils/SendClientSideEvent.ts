import * as amplitude from '@amplitude/analytics-browser'
import Atmosphere from '../Atmosphere'

const SendClientSideEvent = (
  atmosphere: Atmosphere,
  event: string,
  options?: Record<string, any>
) => {
  amplitude.track(event, options, {
    user_id: atmosphere.viewerId
  })
}

export default SendClientSideEvent
