import {AnalyticsEvent, IdentifyOptions} from '../analytics'
import segment from '../../segmentIo'
import {CacheWorker, DataLoaderBase} from '../../../graphql/DataLoaderCache'

const {SEGMENT_WRITE_KEY} = process.env

/**
 * Wrapper for segment providing a more typesafe interface
 */
export class SegmentAnalytics {
  private segmentIo: any

  constructor() {
    this.segmentIo = segment
  }

  identify(options: IdentifyOptions) {
    // used as a failsafe for PPMIs
    if (!SEGMENT_WRITE_KEY) return
    const {userId, anonymousId, ...traits} = options
    return this.segmentIo.identify({
      userId,
      traits,
      anonymousId
    })
  }

  track(
    userId: string,
    event: AnalyticsEvent,
    dataloader: CacheWorker<DataLoaderBase>,
    properties?: any
  ) {
    // used as a failsafe for PPMIs
    if (!SEGMENT_WRITE_KEY) return
    return this.segmentIo.track(
      {
        userId,
        event,
        properties
      },
      dataloader
    )
  }
}
