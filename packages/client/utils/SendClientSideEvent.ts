import Atmosphere from '../Atmosphere'
import * as amplitude from '@amplitude/analytics-browser'

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
