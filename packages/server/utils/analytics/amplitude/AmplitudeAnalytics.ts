import {init, track} from '@amplitude/analytics-node'
import PROD from '../../../PROD'
import {AnalyticsEvent} from '../analytics'

const {AMPLITUDE_WRITE_KEY} = process.env

/**
 * Wrapper for segment providing a more typesafe interface
 */
export class AmplitudeAnalytics {
  constructor() {
    init(AMPLITUDE_WRITE_KEY || 'x', {
      flushQueueSize: PROD ? 20 : 1,
      optOut: !AMPLITUDE_WRITE_KEY
    })
  }

  track(userId: string, event: AnalyticsEvent, properties?: Record<string, any>) {
    return track(event, properties, {
      user_id: userId
    })
  }
}
