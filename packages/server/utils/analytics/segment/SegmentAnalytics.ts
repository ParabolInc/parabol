import {AnalyticsEvent} from '../analytics'
import segment from '../../segmentIo'
import {CacheWorker, DataLoaderBase} from '../../../graphql/DataLoaderCache'

/**
 * Wrapper for segment providing a more typesafe interface
 */
export class SegmentAnalytics {
  private segmentIo: any

  constructor() {
    this.segmentIo = segment
  }

  track(
    userId: string,
    event: AnalyticsEvent,
    dataloader: CacheWorker<DataLoaderBase>,
    properties?: any
  ) {
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
