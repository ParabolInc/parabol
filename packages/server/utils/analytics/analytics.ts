import Meeting from '../../database/types/Meeting'
import MeetingMember from '../../database/types/MeetingMember'
import MeetingTemplate from '../../database/types/MeetingTemplate'
import {TeamPromptResponse} from '../../postgres/queries/getTeamPromptResponsesByIds'
import segment from '../segmentIo'
import {createMeetingTemplateAnalyticsParams} from './helpers'
import {SegmentAnalytics} from './segment/SegmentAnalytics'

export type AnalyticsEvent = 'Meeting Started' | 'Meeting Joined' | 'Meeting Completed'

/**
 * Provides a unified inteface for sending all the analytics events
 */
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
    const userIdsResponses: Record<string, string> = responses.reduce(
      (previous, response) => ({...previous, [response.userId]: response.plaintextContent}),
      {}
    )
    meetingMembers.forEach((meetingMember) => {
      const plaintextResponseContent = userIdsResponses[meetingMember.userId]
      this.meetingEnd(meetingMember.userId, completedMeeting, meetingMembers, {
        responseAdded: !!plaintextResponseContent
      })
    })
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
    meetingMembers.forEach((meetingMember) =>
      this.meetingEnd(
        meetingMember.userId,
        completedMeeting,
        meetingMembers,
        createMeetingTemplateAnalyticsParams(template)
      )
    )
  }

  sprintPokerEnd = (
    completedMeeting: Meeting,
    meetingMembers: MeetingMember[],
    template: MeetingTemplate
  ) => {
    meetingMembers.forEach((meetingMember) =>
      this.meetingEnd(
        meetingMember.userId,
        completedMeeting,
        meetingMembers,
        createMeetingTemplateAnalyticsParams(template)
      )
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
      teamMembersCount: meetingMembers.length, // TODO: use team members count
      teamMembersPresentCount: meetingMembers.length,
      teamId,
      ...meetingSpecificProperties
    })
  }

  private track = (userId: string, event: AnalyticsEvent, properties?: any) =>
    this.segmentAnalytics.track(userId, event, properties)
}

export const analytics = new Analytics()
