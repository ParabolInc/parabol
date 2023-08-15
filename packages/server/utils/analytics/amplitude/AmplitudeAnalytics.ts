import {init, track} from '@amplitude/analytics-node'
import {AnalyticsEvent} from '../analytics'
import {getUserById} from '../../../postgres/queries/getUsersByIds'
import PROD from '../../../PROD'

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

  async track(userId: string, event: AnalyticsEvent, properties?: Record<string, any>) {
    const user = userId ? await getUserById(userId) : null
    const {email} = user ?? {}
    const props = {...properties, email}
    return track(event, props, {
      user_id: userId
    })
  }
}
