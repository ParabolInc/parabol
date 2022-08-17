import {CHECKIN} from '../../../client/utils/constants'
import Meeting from '../../database/types/Meeting'
import MeetingMember from '../../database/types/MeetingMember'
import MeetingTemplate from '../../database/types/MeetingTemplate'

export const createMeetingProperties = (
  meeting: Meeting,
  meetingMembers?: MeetingMember[],
  template?: MeetingTemplate
) => {
  const {id: meetingId, teamId, facilitatorUserId, meetingType, phases} = meeting
  const hasIcebreaker = phases[0]?.phaseType === CHECKIN
  return {
    meetingId,
    teamId,
    facilitatorUserId,
    meetingType,
    hasIcebreaker,
    teamMembersPresentCount: meetingMembers?.length,
    meetingTemplateId: template?.id,
    meetingTemplateName: template?.name,
    meetingTemplateScope: template?.scope,
    meetingTemplateIsFromParabol: template?.isStarter
  }
}
