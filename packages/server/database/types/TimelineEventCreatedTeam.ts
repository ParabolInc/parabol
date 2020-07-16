import TimelineEvent from './TimelineEvent'
import {TimelineEventEnum} from 'parabol-client/types/graphql'

interface Input {
  id?: string
  createdAt?: Date
  interactionCount?: number
  seenCount?: number
  userId: string
  teamId: string
  orgId: string
}
export default class TimelineEventCreatedTeam extends TimelineEvent {
  teamId: string
  orgId: string
  constructor(input: Input) {
    super({...input, type: TimelineEventEnum.createdTeam})
    const {teamId, orgId} = input
    this.teamId = teamId
    this.orgId = orgId
  }
}
