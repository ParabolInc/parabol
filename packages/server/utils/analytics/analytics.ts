import SegmentIo from 'analytics-node'
import Meeting from '../../database/types/Meeting'
import MeetingMember from '../../database/types/MeetingMember'
import MeetingTemplate from '../../database/types/MeetingTemplate'
import {TeamPromptResponse} from '../../postgres/queries/getTeamPromptResponsesByIds'
import segment from '../segmentIo'

type AnalyticsEvent = 'Meeting Started' | 'Meeting Joined' | 'Meeting Completed'

/**
 * Wrapper for segment providing a more typesafe interface
 */
class SegmentAnalytics {
  constructor(private segmentIo: SegmentIo) {}

  track(userId: string, event: AnalyticsEvent, properties?: any) {
    return this.segmentIo.track({
      userId,
      event,
      properties
    })
  }
}

class Analytics {
  private segmentAnalytics: SegmentAnalytics

  constructor() {
    this.segmentAnalytics = new SegmentAnalytics(segment)
  }

  teamPromptEnd = (
    completedMeeting: Meeting,
    meetingMembers: MeetingMember[],
    responses: TeamPromptResponse[]
  ) => {
    const userIdsResponses = responses.map((response) => ({response, userId: response.userId}))
    meetingMembers.forEach((meetingMember) =>
      this.meetingEnd(meetingMember.userId, completedMeeting, meetingMembers, {
        responseAdded: userIdsResponses[meetingMember.userId].response?.length > 0
      })
    )
  }

  checkInEnd = (completedMeeting: Meeting, meetingMembers: MeetingMember[]) => {
    meetingMembers.forEach((meetingMember) =>
      this.meetingEnd(meetingMember.userId, completedMeeting, meetingMembers)
    )
  }

  retrospectiveEnd = (
    completedMeeting: Meeting,
    meetingMembers: MeetingMember[],
    template: MeetingTemplate
  ) => {
    const templateProperties = {
      meetingTemplateId: template.id,
      meetingTemplateName: template.name,
      meetingTemplateScope: template.scope,
      meetingTemplateIsFromParabol: !!template.isStarter
    }
    meetingMembers.forEach((meetingMember) =>
      this.meetingEnd(meetingMember.userId, completedMeeting, meetingMembers, templateProperties)
    )
  }

  sprintPokerEnd = (
    completedMeeting: Meeting,
    meetingMembers: MeetingMember[],
    template: MeetingTemplate
  ) => {
    const templateProperties = {
      meetingTemplateId: template.id,
      meetingTemplateName: template.name,
      meetingTemplateScope: template.scope,
      meetingTemplateIsFromParabol: !!template.isStarter
    }
    meetingMembers.forEach((meetingMember) =>
      this.meetingEnd(meetingMember.userId, completedMeeting, meetingMembers, templateProperties)
    )
  }

  private meetingEnd = (
    userId: string,
    completedMeeting: Meeting,
    meetingMembers: MeetingMember[],
    meetingSpecificProperties?: any
  ) => {
    const {facilitatorUserId, meetingNumber, meetingType, phases, teamId} = completedMeeting
    const presentMemberUserIds = meetingMembers.map(({userId}) => userId)
    const wasFacilitator = userId === facilitatorUserId
    this.track(userId, 'Meeting Completed', {
      hasIcebreaker: phases[0]?.phaseType === 'checkin',
      // include wasFacilitator as a flag to handle 1 per meeting
      wasFacilitator,
      userIds: wasFacilitator ? presentMemberUserIds : undefined,
      meetingType,
      meetingNumber,
      teamMembersCount: meetingMembers.length,
      teamMembersPresentCount: meetingMembers.length,
      teamId,
      ...meetingSpecificProperties
    })
  }

  private track = (userId: string, event: AnalyticsEvent, properties?: any) =>
    this.segmentAnalytics.track(userId, event, properties)
}

export const analytics = new Analytics()
