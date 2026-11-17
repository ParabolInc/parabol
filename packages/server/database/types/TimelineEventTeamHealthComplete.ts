import TimelineEvent from './TimelineEvent'

interface Input {
  id?: string
  createdAt?: Date
  userId: string
  teamId: string
  orgId: string
  meetingId: string
}
export default class TimelineEventTeamHealthComplete extends TimelineEvent {
  teamId: string
  meetingId: string
  orgId: string
  constructor(input: Input) {
    super({
      ...input,
      type: 'TEAM_HEALTH_COMPLETE'
    })
    const {teamId, orgId, meetingId} = input
    this.teamId = teamId
    this.orgId = orgId
    this.meetingId = meetingId
  }
}
