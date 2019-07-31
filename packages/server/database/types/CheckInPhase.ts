import CheckInStage from './CheckInStage'
import {CHECKIN} from '../../../client/utils/constants'
import convertToTaskContent from '../../../client/utils/draftjs/convertToTaskContent'
import {makeCheckinGreeting, makeCheckinQuestion} from '../../../client/utils/makeCheckinGreeting'
import GenericMeetingPhase from './GenericMeetingPhase'

interface TeamMember {
  id: string
  checkInOrder: number
}

export default class CheckInPhase extends GenericMeetingPhase {
  checkInGreeting: {content: string; language: string}
  checkInQuestion: string
  stages: CheckInStage[]

  constructor (teamId: string, meetingCount: number, teamMembers: TeamMember[]) {
    super(CHECKIN)
    this.checkInGreeting = makeCheckinGreeting(meetingCount, teamId)
    this.checkInQuestion = convertToTaskContent(makeCheckinQuestion(meetingCount, teamId))
    this.stages = teamMembers
      .sort((a, b) => (a.checkInOrder > b.checkInOrder ? 1 : -1))
      .map((teamMember) => new CheckInStage(teamMember.id))
  }
}
