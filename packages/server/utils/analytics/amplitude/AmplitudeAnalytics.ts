import {identify, Identify, init, track} from '@amplitude/analytics-node'
import {AnalyticsEvent, IdentifyOptions} from '../analytics'

const {AMPLITUDE_WRITE_KEY} = process.env

/**
 * Wrapper for amplitude providing a more typesafe interface
 */
export class AmplitudeAnalytics {
  constructor() {
    // used as a failsafe for PPMIs
    if (!AMPLITUDE_WRITE_KEY) return
    init(AMPLITUDE_WRITE_KEY, {
      flushQueueSize: __PRODUCTION__ ? 20 : 1,
      optOut: !AMPLITUDE_WRITE_KEY
    })
  }

  identify(options: IdentifyOptions) {
    // used as a failsafe for PPMIs
    if (!AMPLITUDE_WRITE_KEY) return
    const {userId, anonymousId, ...traits} = options
    const identity = new Identify()

    let trait: keyof typeof traits
    for (trait in traits) {
      const traitValue = traits[trait]
      if (traitValue !== undefined) {
        identity.set(trait, traitValue.toString())
      }
    }

    return identify(identity, {
      user_id: userId,
      device_id: anonymousId
    })
  }

  async track(
    userId: string,
    email: string | undefined,
    event: AnalyticsEvent,
    properties?: Record<string, any>
  ) {
    // used as a failsafe for PPMIs
    if (!AMPLITUDE_WRITE_KEY) return
    const props = {...properties, email}
    return track(event, props, {
      user_id: userId
    })
  }
}
