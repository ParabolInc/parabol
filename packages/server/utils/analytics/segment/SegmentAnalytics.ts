import {AnalyticsEvent} from '../analytics'
import NullableDataLoader from '../../../dataloader/NullableDataLoader'
import IUser from '../../../postgres/types/IUser'
import segment from '../../segmentIo'

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
    dataloader: NullableDataLoader<string, IUser, string>,
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
