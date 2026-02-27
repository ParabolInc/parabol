import type {TimelineEvent as TimelineEventDB} from '../../../postgres/types'
import type {TimelineEventJoinedParabolResolvers} from '../resolverTypes'

export type TimelineEventJoinedParabolSource = TimelineEventDB & {type: 'joinedParabol'}

const TimelineEventJoinedParabol: TimelineEventJoinedParabolResolvers = {}

export default TimelineEventJoinedParabol
