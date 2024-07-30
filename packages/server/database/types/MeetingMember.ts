import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {MeetingTypeEnum} from '../../graphql/public/resolverTypes'

interface MeetingMemberInput {
  id?: string
  updatedAt?: Date
  teamId: string
  userId: string
  meetingType: MeetingTypeEnum
  meetingId: string
}

export default abstract class MeetingMember {
  id: string
  meetingType: MeetingTypeEnum
  meetingId: string
  teamId: string
  updatedAt = new Date()
  userId: string
  constructor(input: MeetingMemberInput) {
    const {teamId, meetingType, id, updatedAt, meetingId, userId} = input
    this.id = id ?? toTeamMemberId(meetingId, userId)
    this.meetingType = meetingType
    this.meetingId = meetingId
    this.teamId = teamId
    this.updatedAt = updatedAt ?? new Date()
    this.userId = userId
  }
}
