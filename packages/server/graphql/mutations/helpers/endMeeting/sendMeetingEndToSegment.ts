import {MeetingMember, NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'
import Meeting from '../../../../database/types/Meeting'
import MeetingTemplate from '../../../../database/types/MeetingTemplate'
import segmentIo from '../../../../utils/segmentIo'

const sendMeetingEndToSegment = async (
  completedMeeting: Meeting,
  meetingMembers: MeetingMember[],
  template?: MeetingTemplate
) => {
  const {facilitatorUserId, meetingNumber, meetingType, phases, teamId} = completedMeeting
  const presentMembers = meetingMembers.filter(
    (meetingMember) => meetingMember.isCheckedIn === true
  )
  const presentMemberUserIds = presentMembers.map(({userId}) => userId)
  presentMemberUserIds.forEach((userId) => {
    const wasFacilitator = userId === facilitatorUserId
    segmentIo.track({
      userId,
      event: 'Meeting Completed',
      properties: {
        hasIcebreaker: phases[0].phaseType === NewMeetingPhaseTypeEnum.checkin,
        // include wasFacilitator as a flag to handle 1 per meeting
        wasFacilitator,
        userIds: wasFacilitator ? presentMemberUserIds : undefined,
        meetingType,
        meetingTemplateId: template?.id,
        meetingTemplateName: template?.name,
        meetingTemplateScope: template?.scope,
        meetingTemplateIsFromParabol: !!template?.isStarter,
        meetingNumber,
        teamMembersCount: meetingMembers.length,
        teamMembersPresentCount: presentMembers.length,
        teamId
      }
    })
  })
}

export default sendMeetingEndToSegment
