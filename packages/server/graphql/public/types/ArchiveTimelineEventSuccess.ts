import type {ArchiveTimelineEventSuccessResolvers} from '../resolverTypes'

export type ArchiveTimelineEventSuccessSource = {
  timelineEventId: string
}

const ArchiveTimelineEventSuccess: ArchiveTimelineEventSuccessResolvers = {
  timelineEvent: ({timelineEventId}, _args, {dataLoader}) => {
    return dataLoader.get('timelineEvents').loadNonNull(timelineEventId)
  }
}

export default ArchiveTimelineEventSuccess
