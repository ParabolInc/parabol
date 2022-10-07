import Meeting from '../../database/types/Meeting'
import MeetingMember from '../../database/types/MeetingMember'
import MeetingRetrospective from '../../database/types/MeetingRetrospective'
import MeetingTemplate from '../../database/types/MeetingTemplate'
import {ReactableEnum} from '../../database/types/Reactable'
import {TaskServiceEnum} from '../../database/types/Task'
import {IntegrationProviderServiceEnumType} from '../../graphql/types/IntegrationProviderServiceEnum'
import {TeamPromptResponse} from '../../postgres/queries/getTeamPromptResponsesByIds'
import {MeetingTypeEnum} from '../../postgres/types/Meeting'
import {MeetingSeries} from '../../postgres/types/MeetingSeries'
import segment from '../segmentIo'
import {createMeetingProperties} from './helpers'
import {SegmentAnalytics} from './segment/SegmentAnalytics'

export type MeetingSeriesAnalyticsProperties = Pick<
  MeetingSeries,
  'id' | 'duration' | 'recurrenceRule' | 'meetingType' | 'title'
> & {teamId: string; facilitatorId: string}

export type OrgTierChangeEventProperties = {
  orgId: string
  domain?: string
  orgName: string
  oldTier: string
  newTier: string
  billingLeaderEmail: string
}

export type TaskProperties = {
  taskId: string
  teamId: string
  meetingId?: string
  meetingType?: MeetingTypeEnum
  inMeeting: boolean
}

export type TaskEstimateProperties = {
  taskId: string
  meetingId: string
  dimensionName: string
  service?: TaskServiceEnum
  success: boolean
  errorMessage?: string
}

export type MeetingSettings = {
  hasIcebreaker?: boolean
  disableAnonymity?: boolean
}

export type AnalyticsEvent =
  // meeting
  | 'Meeting Started'
  | 'Meeting Joined'
  | 'Meeting Completed'
  | 'Comment Added'
  | 'Response Added'
  | 'Reactji Interacted'
  | 'Meeting Recurrence Started'
  | 'Meeting Recurrence Stopped'
  | 'Meeting Settings Changed'
  // team
  | 'Integration Added'
  | 'Integration Removed'
  | 'Invite Email Sent'
  | 'Invite Accepted'
  | 'Sent Invite Accepted'
  // org
  | 'Organization Upgraded'
  | 'Organization Downgraded'
  // task
  | 'Task Created'
  | 'Task Published'
  | 'Task Estimate Set'
  // user
  | 'Summary Email Setting Changed'

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
    completedMeeting: MeetingRetrospective,
    meetingMembers: MeetingMember[],
    template: MeetingTemplate
  ) => {
    const {disableAnonymity} = completedMeeting
    meetingMembers.forEach((meetingMember) =>
      this.meetingEnd(meetingMember.userId, completedMeeting, meetingMembers, template, {
        disableAnonymity
      })
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

  recurrenceStarted = (userId: string, meetingSeries: MeetingSeriesAnalyticsProperties) => {
    this.track(userId, 'Meeting Recurrence Started', meetingSeries)
  }

  recurrenceStopped = (userId: string, meetingSeries: MeetingSeriesAnalyticsProperties) => {
    this.track(userId, 'Meeting Recurrence Stopped', meetingSeries)
  }

  meetingJoined = (userId: string, meeting: Meeting) => {
    this.track(userId, 'Meeting Joined', createMeetingProperties(meeting))
  }

  meetingSettingsChanged = (
    userId: string,
    teamId: string,
    meetingType: MeetingTypeEnum,
    meetingSettings: MeetingSettings
  ) => {
    this.track(userId, 'Meeting Settings Changed', {
      teamId,
      meetingType,
      ...meetingSettings
    })
  }

  commentAdded = (
    userId: string,
    meeting: Meeting,
    isAnonymous: boolean,
    isAsync: boolean,
    isReply: boolean
  ) => {
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

    this.track(inviterId, 'Sent Invite Accepted', {
      teamId,
      inviteeId: userId,
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
    taskProperties: TaskProperties,
    service: IntegrationProviderServiceEnumType
  ) => {
    this.track(userId, 'Task Published', {
      ...taskProperties,
      service
    })
  }

  taskCreated = (userId: string, taskProperties: TaskProperties) => {
    this.track(userId, 'Task Created', taskProperties)
  }

  taskEstimateSet = (userId: string, taskEstimateProperties: TaskEstimateProperties) => {
    this.track(userId, 'Task Estimate Set', taskEstimateProperties)
  }

  toggleSubToSummaryEmail = (userId: string, subscribeToSummaryEmail: boolean) => {
    this.track(userId, 'Summary Email Setting Changed', {subscribeToSummaryEmail})
  }

  private track = (userId: string, event: AnalyticsEvent, properties?: any) =>
    this.segmentAnalytics.track(userId, event, properties)
}

export const analytics = new Analytics()
