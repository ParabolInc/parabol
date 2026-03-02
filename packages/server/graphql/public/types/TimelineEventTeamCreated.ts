import type {TimelineEvent as TimelineEventDB} from '../../../postgres/types'
import type {TimelineEventTeamCreatedResolvers} from '../resolverTypes'

export type TimelineEventTeamCreatedSource = Extract<TimelineEventDB, {type: 'createdTeam'}>

const TimelineEventTeamCreated: TimelineEventTeamCreatedResolvers = {}

export default TimelineEventTeamCreated
