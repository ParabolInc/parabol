import SegmentIo from 'analytics-node'
import {AnalyticsEvent} from '../analytics'

/**
 * Wrapper for segment providing a more typesafe interface
 */
export class SegmentAnalytics {
  constructor(private segmentIo: SegmentIo) {}

  track(userId: string, event: AnalyticsEvent, properties?: any) {
    return this.segmentIo.track({
      userId,
      event,
      properties
    })
  }
}
