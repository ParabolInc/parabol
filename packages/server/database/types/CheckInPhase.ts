import CheckInStage from 'server/database/types/CheckInStage'
import {CHECKIN} from 'universal/utils/constants'
import convertToTaskContent from 'universal/utils/draftjs/convertToTaskContent'
import {makeCheckinGreeting, makeCheckinQuestion} from 'universal/utils/makeCheckinGreeting'
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
