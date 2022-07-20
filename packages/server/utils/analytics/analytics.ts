import {NewMeetingPhaseTypeEnum} from '../../database/types/GenericMeetingPhase'
import Meeting from '../../database/types/Meeting'
import MeetingMember from '../../database/types/MeetingMember'
import MeetingTemplate from '../../database/types/MeetingTemplate'
import {IntegrationProviderServiceEnumType} from '../../graphql/types/IntegrationProviderServiceEnum'
import {TeamPromptResponse} from '../../postgres/queries/getTeamPromptResponsesByIds'
import {AnyMeeting} from '../../postgres/types/Meeting'
import segment from '../segmentIo'
import {createMeetingTemplateAnalyticsParams} from './helpers'
import {SegmentAnalytics} from './segment/SegmentAnalytics'

export type OrgTierChangeEventProperties = {
  orgId: string
  domain?: string
  orgName: string
  oldTier: string
  newTier: string
  billingLeaderEmail: string
}

export type AnalyticsEvent =
  // meeting
  | 'Meeting Started'
  | 'Meeting Joined'
  | 'Meeting Completed'
  | 'Comment Added'
  // team
  | 'Integration Added'
  | 'Integration Removed'
  | 'Invite Email Sent'
  | 'Invite Accepted'
  // org
  | 'Organization Upgraded'
  | 'Organization Downgraded'
  // task
  | 'Task Created'
  | 'Task Published'

/**
 * Provides a unified inteface for sending all the analytics events
 */
class Analytics {
  private segmentAnalytics: SegmentAnalytics

  constructor() {
    this.segmentAnalytics = new SegmentAnalytics(segment)
  }

  // meeting
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

  commentAdded = (userId: string, meeting: Meeting, isAnonymous, isAsync, isReply) => {
    this.track(userId, 'Comment Added', {
      meetingId: meeting.id,
      meetingType: meeting.meetingType,
      teamId: meeting.teamId,
      isAnonymous,
      isAsync,
      isReply
    })
  }

  // team
  integrationAdded = (
    userId: string,
    teamId: string,
    service: IntegrationProviderServiceEnumType | 'slack'
  ) => {
    this.track(userId, 'Integration Added', {
      teamId,
      service
    })
  }

  integrationRemoved = (
    userId: string,
    teamId: string,
    service: IntegrationProviderServiceEnumType | 'slack'
  ) => {
    this.track(userId, 'Integration Removed', {
      teamId,
      service
    })
  }

  inviteEmailSent = (
    userId: string,
    teamId: string,
    inviteeEmail: string,
    isInviteeParabolUser: boolean,
    inviteTo: 'meeting' | 'team',
    success: boolean
  ) => {
    this.track(userId, 'Invite Email Sent', {
      teamId,
      inviteeEmail,
      isInviteeParabolUser,
      inviteTo,
      success
    })
  }

  inviteAccepted = (
    userId: string,
    teamId: string,
    isNewUser: boolean,
    acceptAt: 'meeting' | 'team'
  ) => {
    this.track(userId, 'Invite Accepted', {
      teamId,
      isNewUser,
      acceptAt
    })
  }

  //org
  organizationUpgraded = (userId: string, upgradeEventProperties: OrgTierChangeEventProperties) => {
    this.track(userId, 'Organization Upgraded', upgradeEventProperties)
  }

  organizationDowngraded = (
    userId: string,
    downgradeEventProperties: OrgTierChangeEventProperties
  ) => {
    this.track(userId, 'Organization Downgraded', downgradeEventProperties)
  }

  // task
  taskPublished = (
    userId: string,
    teamId: string,
    service: IntegrationProviderServiceEnumType,
    meetingId?: string
  ) => {
    this.track(userId, 'Task Published', {
      teamId,
      meetingId,
      service
    })
  }

  taskCreated = (
    userId: string,
    teamId: string,
    isReply: boolean,
    meeting?: AnyMeeting,
    service?: IntegrationProviderServiceEnumType
  ) => {
    let isAsync
    let meetingId
    if (meeting) {
      const {phases, id} = meeting
      meetingId = id
      const discussPhase = phases.find(
        ({phaseType}: {phaseType: NewMeetingPhaseTypeEnum}) =>
          phaseType === 'discuss' || phaseType === 'agendaitems'
      )
      if (discussPhase) {
        const {stages} = discussPhase
        isAsync = stages.some((stage) => stage.isAsync)
      }
    }

    this.track(userId, 'Task Created', {
      meetingId,
      teamId,
      isAsync,
      isReply,
      service
    })
  }

  private track = (userId: string, event: AnalyticsEvent, properties?: any) =>
    this.segmentAnalytics.track(userId, event, properties)
}

export const analytics = new Analytics()
