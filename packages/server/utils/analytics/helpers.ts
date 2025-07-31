import {CHECKIN} from '../../../client/utils/constants'
import type MeetingTemplate from '../../database/types/MeetingTemplate'
import type {AnyMeeting, AnyMeetingMember} from '../../postgres/types/Meeting'

export const createMeetingProperties = (
  meeting: AnyMeeting,
  meetingMembers?: AnyMeetingMember[],
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
      meetingType === 'retrospective' ? (meeting.disableAnonymity ?? false) : undefined
  }
}
