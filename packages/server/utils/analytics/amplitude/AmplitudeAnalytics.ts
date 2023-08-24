import {init, track} from '@amplitude/analytics-node'
import {AnalyticsEvent} from '../analytics'
import PROD from '../../../PROD'
import NullableDataLoader from '../../../dataloader/NullableDataLoader'
import IUser from '../../../postgres/types/IUser'

const {AMPLITUDE_WRITE_KEY} = process.env

/**
 * Wrapper for amplitude providing a more typesafe interface
 */
export class AmplitudeAnalytics {
  constructor() {
    // used as a failsafe for PPMIs
    if (!AMPLITUDE_WRITE_KEY) return
    init(AMPLITUDE_WRITE_KEY, {
      flushQueueSize: PROD ? 20 : 1,
      optOut: !AMPLITUDE_WRITE_KEY
    })
  }

  async track(
    userId: string,
    event: AnalyticsEvent,
    dataloader: NullableDataLoader<string, IUser, string>,
    properties?: Record<string, any>
  ) {
    // used as a failsafe for PPMIs
    if (!AMPLITUDE_WRITE_KEY) return
    const user = await dataloader.load(userId)
    const {email} = user ?? {}
    const props = {...properties, email}
    return track(event, props, {
      user_id: userId
    })
  }
}
