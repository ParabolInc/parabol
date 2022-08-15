import Meeting from '../../database/types/Meeting'
import MeetingMember from '../../database/types/MeetingMember'
import MeetingTemplate from '../../database/types/MeetingTemplate'
import {ReactableEnum} from '../../database/types/Reactable'
import {IntegrationProviderServiceEnumType} from '../../graphql/types/IntegrationProviderServiceEnum'
import {TeamPromptResponse} from '../../postgres/queries/getTeamPromptResponsesByIds'
import {AnyMeeting, MeetingTypeEnum} from '../../postgres/types/Meeting'
import segment from '../segmentIo'
import {createMeetingProperties} from './helpers'
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
  | 'Response Added'
  | 'Reactji Interacted'
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
      this.meetingEnd(meetingMember.userId, completedMeeting, meetingMembers, undefined, {
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
      this.meetingEnd(meetingMember.userId, completedMeeting, meetingMembers, template)
    )
  }

  sprintPokerEnd = (
    completedMeeting: Meeting,
    meetingMembers: MeetingMember[],
    template: MeetingTemplate
  ) => {
    meetingMembers.forEach((meetingMember) =>
      this.meetingEnd(meetingMember.userId, completedMeeting, meetingMembers, template)
    )
  }

  private meetingEnd = (
    userId: string,
    completedMeeting: Meeting,
    meetingMembers: MeetingMember[],
    template?: MeetingTemplate,
    meetingSpecificProperties?: any
  ) => {
    this.track(userId, 'Meeting Completed', {
      wasFacilitator: completedMeeting.facilitatorUserId === userId,
      ...createMeetingProperties(completedMeeting, meetingMembers, template),
      ...meetingSpecificProperties
    })
  }

  meetingStarted = (userId: string, meeting: Meeting, template?: MeetingTemplate) => {
    this.track(userId, 'Meeting Started', createMeetingProperties(meeting, undefined, template))
  }

  meetingJoined = (userId: string, meeting: Meeting) => {
    this.track(userId, 'Meeting Joined', createMeetingProperties(meeting))
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

  responseAdded = (
    userId: string,
    meetingId: string,
    teamPromptResponseId: string,
    isUpdate: boolean
  ) => {
    this.track(userId, 'Response Added', {
      meetingId,
      teamPromptResponseId,
      isUpdate
    })
  }

  reactjiInteracted = (
    userId: string,
    meetingId: string,
    meetingType: MeetingTypeEnum,
    reactableId: string,
    reactableType: ReactableEnum,
    isRemove: boolean
  ) => {
    this.track(userId, 'Reactji Interacted', {
      meetingId,
      meetingType,
      reactableId,
      reactableType,
      isRemove
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
    inviterId: string,
    isNewUser: boolean,
    acceptAt: 'meeting' | 'team'
  ) => {
    this.track(userId, 'Invite Accepted', {
      teamId,
      inviterId,
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
    const {id: meetingId, meetingType} = meeting || {}

    this.track(userId, 'Task Created', {
      meetingId,
      teamId,
      inMeeting: !!meetingId,
      meetingType,
      isReply,
      service
    })
  }

  private track = (userId: string, event: AnalyticsEvent, properties?: any) =>
    this.segmentAnalytics.track(userId, event, properties)
}

export const analytics = new Analytics()
