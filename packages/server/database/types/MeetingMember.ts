import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {MeetingTypeEnum} from 'parabol-client/types/graphql'

interface MeetingMemberInput {
  id?: string
  isCheckedIn?: boolean
  updatedAt?: Date
  teamId: string
  userId: string
  meetingType: MeetingTypeEnum
  meetingId: string
}

export default abstract class MeetingMember {
  id: string
  isCheckedIn: boolean
  meetingType: MeetingTypeEnum
  meetingId: string
  teamId: string
  updatedAt = new Date()
  userId: string
  constructor(input: MeetingMemberInput) {
    const {teamId, meetingType, id, updatedAt, isCheckedIn, meetingId, userId} = input
    this.id = id ?? toTeamMemberId(meetingId, userId)
    this.isCheckedIn = isCheckedIn ?? false
    this.meetingType = meetingType
    this.meetingId = meetingId
    this.teamId = teamId
    this.updatedAt = updatedAt ?? new Date()
    this.userId = userId
  }
}
