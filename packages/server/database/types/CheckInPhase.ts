import {NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'
import convertToTaskContent from 'parabol-client/utils/draftjs/convertToTaskContent'
import {
  makeCheckinGreeting,
  makeCheckinQuestion
} from 'parabol-client/utils/makeCheckinGreeting'
import CheckInStage from './CheckInStage'
import GenericMeetingPhase from './GenericMeetingPhase'

interface TeamMember {
  id: string
  checkInOrder: number
}

export default class CheckInPhase extends GenericMeetingPhase {
  checkInGreeting: {content: string; language: string}
  checkInQuestion: string
  stages: CheckInStage[]

  constructor(teamId: string, meetingCount: number, teamMembers: TeamMember[]) {
    super(NewMeetingPhaseTypeEnum.checkin)
    this.checkInGreeting = makeCheckinGreeting(meetingCount, teamId)
    this.checkInQuestion = convertToTaskContent(makeCheckinQuestion(meetingCount, teamId))
    this.stages = teamMembers
      .sort((a, b) => (a.checkInOrder > b.checkInOrder ? 1 : -1))
      .map((teamMember) => new CheckInStage(teamMember.id))
  }
}
