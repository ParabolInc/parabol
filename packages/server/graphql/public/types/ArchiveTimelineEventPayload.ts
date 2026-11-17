import type {ArchiveTimelineEventPayloadResolvers} from '../resolverTypes'

export type ArchiveTimelineEventPayloadSource = {
  timelineEventId: string
}

const ArchiveTimelineEventPayload: ArchiveTimelineEventPayloadResolvers = {
  timelineEvent: ({timelineEventId}, _args, {dataLoader}) => {
    return dataLoader.get('timelineEvents').loadNonNull(timelineEventId)
  }
}

export default ArchiveTimelineEventPayload
