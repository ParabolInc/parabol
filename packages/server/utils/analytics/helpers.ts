import {CHECKIN} from '../../../client/utils/constants'
import MeetingMember from '../../database/types/MeetingMember'
import MeetingTemplate from '../../database/types/MeetingTemplate'
import {AnyMeeting} from '../../postgres/types/Meeting'

export const createMeetingProperties = (
  meeting: AnyMeeting,
  meetingMembers?: MeetingMember[],
  template?: MeetingTemplate
) => {
  const {id: meetingId, teamId, facilitatorUserId, meetingType, phases} = meeting
  const hasIcebreaker = phases.some(({phaseType}) => phaseType === CHECKIN)
  const hasTeamHealth = phases.some(({phaseType}) => phaseType === 'TEAM_HEALTH')
  return {
    meetingId,
    teamId,
    facilitatorUserId,
    meetingType,
    hasIcebreaker,
    hasTeamHealth,
    teamMembersPresentCount: meetingMembers?.length,
    meetingTemplateId: template?.id,
    meetingTemplateName: template?.name,
    meetingTemplateScope: template?.scope,
    meetingTemplateIsFromParabol: template?.isStarter ?? false,
    meetingTemplateIsFree: template?.isFree ?? false,
    meetingTemplateCategory: template?.mainCategory,
    meetingSeriesId: meeting.meetingSeriesId,
    disableAnonymity:
      meetingType === 'retrospective' ? meeting.disableAnonymity ?? false : undefined
  }
}
