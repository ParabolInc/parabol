import {ReasonToDowngradeEnum} from '../../../client/__generated__/DowngradeToStarterMutation.graphql'
import type {UpgradeCTALocationEnumType} from '../../../client/shared/UpgradeCTALocationEnumType'
import TeamPromptResponseId from '../../../client/shared/gqlIds/TeamPromptResponseId'
import {PARABOL_AI_USER_ID} from '../../../client/utils/constants'
import {TeamLimitsEmailType} from '../../billing/helpers/sendTeamsLimitEmail'
import MeetingTemplate from '../../database/types/MeetingTemplate'
import {DataLoaderWorker} from '../../graphql/graphql'
import {ModifyType, ReactableEnum} from '../../graphql/public/resolverTypes'
import {IntegrationProviderServiceEnumType} from '../../graphql/types/IntegrationProviderServiceEnum'
import {SlackNotification, TeamPromptResponse, TemplateScale} from '../../postgres/types'
import {
  AnyMeeting,
  AnyMeetingMember,
  MeetingTypeEnum,
  RetrospectiveMeeting
} from '../../postgres/types/Meeting'
import {MeetingSeries} from '../../postgres/types/MeetingSeries'
import {TaskServiceEnum} from '../../postgres/types/TaskIntegration'
import {AmplitudeAnalytics} from './amplitude/AmplitudeAnalytics'
import {createMeetingProperties} from './helpers'
export type AnalyticsUser = {
  id: string
  email?: string
}

export type MeetingSeriesAnalyticsProperties = Pick<
  MeetingSeries,
  'id' | 'duration' | 'recurrenceRule' | 'meetingType' | 'title'
> & {teamId: string; facilitatorId: string}

export type IdentifyOptions = {
  userId: string
  email: string
  anonymousId?: string
  name?: string
  isActive?: boolean
  highestTier?: string
  isPatient0?: boolean
  createdAt?: Date
}

export type MeetingTimerEventProperties = {
  meetingId: string
  phaseType: string
  viewCount: number
  isAsync: boolean | null
  newScheduledEndTime: Date | null
  timeRemaining: number | null
  previousScheduledEndTime?: Date | null
  stageStartAt?: Date
}

export type OrgTierChangeEventProperties = {
  orgId: string
  domain?: string
  orgName: string
  oldTier: string
  newTier: string
  isTrial?: boolean
  reasonsForLeaving?: ReasonToDowngradeEnum[]
  otherTool?: string
  billingLeaderEmail?: string
}

export type PokerMeetingTeamRevotedProperties = {
  teamId: string
  hasIcebreaker: boolean
  wasFacilitator: boolean
  meetingNumber: number
  teamMembersCount: number
  teamMembersPresentCount: number
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
  hasTeamHealth?: boolean
  disableAnonymity?: boolean | null
  videoMeetingURL?: string | null
}

export type WebSocketProperties = {
  socketCount: number
  socketId: string
  tms: string[]
}

export type AnalyticsEvent =
  // meeting
  | 'Meeting Started'
  | 'Meeting Joined'
  | 'Meeting Completed'
  | 'Comment Added'
  | 'Response Added'
  | 'Reactji Interacted'
  | 'Reflection Added'
  | 'Meeting Recurrence Started'
  | 'Meeting Recurrence Stopped'
  | 'Meeting Settings Changed'
  | 'Meeting Timer Started'
  | 'Meeting Timer Stopped'
  | 'Meeting Timer Updated'
  | 'Poker Meeting Team Revoted'
  | 'Template Created'
  | 'Template Cloned'
  | 'Template Shared'
  | 'Scale Created'
  | 'Scale Cloned'
  // team
  | 'Team Name Changed'
  | 'Integration Added'
  | 'Integration Removed'
  | 'Invite Email Sent'
  | 'Invite Accepted'
  | 'Sent Invite Accepted'
  | 'Notification Email Sent'
  | 'Team Joined'
  | 'Team Privacy Changed'
  // org
  | 'Upgrade CTA Clicked'
  | 'Organization Upgrade Attempted'
  | 'Organization Upgraded'
  | 'Downgrade Clicked'
  | 'Downgrade Continue Clicked'
  | 'Organization Downgraded'
  | 'Billing Leader Modified'
  // task
  | 'Task Created'
  | 'Task Published'
  | 'Task Estimate Set'
  // page
  | 'Page Created'
  // insight
  | 'Insight Generated'
  | 'Page Insights Generated'
  // user
  | 'Account Created'
  | 'Account Removed'
  | 'Account Paused'
  | 'Account Unpaused'
  | 'Account Name Changed'
  | 'User Removed From Org'
  | 'Connect WebSocket'
  | 'Disconnect WebSocket'
  | 'Summary Email Setting Changed'
  // snackbar
  | 'Snackbar Clicked'
  | 'Snackbar Viewed'
  // Join request
  | 'Join Request Reviewed'
  | 'AutoJoined Team'
  // Suggest Groups
  | 'Suggested Groups Generated'
  | 'Suggest Groups Clicked'
  | 'Reset Groups Clicked'
  // Conversion Tracking
  | 'Conversion Modal Pay Later Clicked'
  | 'Icebreaker Modified'
  // Deprecated Events
  // These will be replaced with tracking plan compliant versions by the data team
  // Lowercase words are for backwards compatibility
  | 'Added Agenda Item'
  | 'Archive Organization'
  | 'Archive Team'
  | 'Enterprise Over User Limit'
  | 'Locked user attempted to join a team'
  | 'Mattermost notification sent'
  | 'Mentioned on Task'
  | 'MSTeams notification sent'
  | 'New Org'
  | 'New Team'
  | 'Poll added'
  | 'Slack notification sent'
  | 'Smart group title changed'
  | 'Task due date set'
  | 'Insights Feedback Submitted'

/**
 * Provides a unified interface for sending all the analytics events
 */
class Analytics {
  private amplitudeAnalytics: AmplitudeAnalytics

  constructor() {
    this.amplitudeAnalytics = new AmplitudeAnalytics()
  }

  // meeting
  teamPromptEnd = async (
    completedMeeting: AnyMeeting,
    meetingMembers: AnyMeetingMember[],
    responses: TeamPromptResponse[],
    dataLoader: DataLoaderWorker
  ) => {
    const userIdsResponses: Record<string, string> = responses.reduce(
      (previous, response) => ({...previous, [response.userId]: response.plaintextContent}),
      {}
    )
    await Promise.all(
      meetingMembers.map(async (meetingMember) => {
        const plaintextResponseContent = userIdsResponses[meetingMember.userId]
        return this.meetingEnd(
          dataLoader,
          meetingMember.userId,
          completedMeeting,
          meetingMembers,
          undefined,
          {
            responseAdded: !!plaintextResponseContent
          }
        )
      })
    )
  }

  checkInEnd = async (
    completedMeeting: AnyMeeting,
    meetingMembers: AnyMeetingMember[],
    dataLoader: DataLoaderWorker
  ) =>
    Promise.all(
      meetingMembers.map((meetingMember) =>
        this.meetingEnd(
          dataLoader,
          meetingMember.userId,
          completedMeeting,
          meetingMembers,
          undefined,
          undefined
        )
      )
    )

  retrospectiveEnd = async (
    completedMeeting: RetrospectiveMeeting,
    meetingMembers: AnyMeetingMember[],
    template: MeetingTemplate,
    dataLoader: DataLoaderWorker
  ) => {
    const {disableAnonymity} = completedMeeting
    return Promise.all(
      meetingMembers.map((meetingMember) =>
        this.meetingEnd(
          dataLoader,
          meetingMember.userId,
          completedMeeting,
          meetingMembers,
          template,
          {
            disableAnonymity
          }
        )
      )
    )
  }

  sprintPokerEnd = (
    completedMeeting: AnyMeeting,
    meetingMembers: AnyMeetingMember[],
    template: MeetingTemplate,
    dataLoader: DataLoaderWorker
  ) => {
    return Promise.all(
      meetingMembers.map((meetingMember) =>
        this.meetingEnd(
          dataLoader,
          meetingMember.userId,
          completedMeeting,
          meetingMembers,
          template
        )
      )
    )
  }

  private meetingEnd = async (
    dataloader: DataLoaderWorker,
    userId: string,
    completedMeeting: AnyMeeting,
    meetingMembers: AnyMeetingMember[],
    template?: MeetingTemplate,
    meetingSpecificProperties?: any
  ) => {
    const user = await dataloader.get('users').load(userId)
    this.track({id: userId, email: user?.email}, 'Meeting Completed', {
      wasFacilitator: completedMeeting.facilitatorUserId === userId,
      ...createMeetingProperties(completedMeeting, meetingMembers, template),
      ...meetingSpecificProperties
    })
  }

  meetingStarted = (user: AnalyticsUser, meeting: AnyMeeting, template?: MeetingTemplate) => {
    this.track(user, 'Meeting Started', createMeetingProperties(meeting, undefined, template))
  }

  recurrenceStarted = (user: AnalyticsUser, meetingSeries: MeetingSeriesAnalyticsProperties) => {
    this.track(user, 'Meeting Recurrence Started', meetingSeries)
  }

  recurrenceStopped = (user: AnalyticsUser, meetingSeries: MeetingSeriesAnalyticsProperties) => {
    this.track(user, 'Meeting Recurrence Stopped', meetingSeries)
  }

  meetingJoined = (user: AnalyticsUser, meeting: AnyMeeting) => {
    this.track(user, 'Meeting Joined', createMeetingProperties(meeting, undefined, undefined))
  }

  meetingSettingsChanged = (
    user: AnalyticsUser,
    teamId: string,
    meetingType: MeetingTypeEnum,
    meetingSettings: MeetingSettings
  ) => {
    this.track(user, 'Meeting Settings Changed', {
      teamId,
      meetingType,
      ...meetingSettings
    })
  }

  commentAdded = (
    user: AnalyticsUser,
    meeting: AnyMeeting,
    isAnonymous: boolean,
    isAsync: boolean,
    isReply: boolean
  ) => {
    this.track(user, 'Comment Added', {
      meetingId: meeting.id,
      meetingType: meeting.meetingType,
      teamId: meeting.teamId,
      isAnonymous,
      isAsync,
      isReply
    })
  }

  responseAdded = (
    user: AnalyticsUser,
    meetingId: string,
    teamPromptResponseId: number,
    isUpdate: boolean
  ) => {
    this.track(user, 'Response Added', {
      meetingId,
      teamPromptResponseId: TeamPromptResponseId.join(teamPromptResponseId),
      isUpdate
    })
  }

  reactjiInteracted = (
    user: AnalyticsUser,
    meetingId: string,
    meetingType: MeetingTypeEnum,
    reactable: {createdBy?: string | null; id: string},
    reactableType: ReactableEnum,
    reactji: string,
    isRemove: boolean
  ) => {
    const isAIComment = 'createdBy' in reactable && reactable.createdBy === PARABOL_AI_USER_ID
    const {id: reactableId} = reactable
    this.track(user, 'Reactji Interacted', {
      meetingId,
      meetingType,
      reactableId,
      reactableType,
      reactji,
      isRemove,
      isAIComment
    })
  }

  reflectionAdded = (user: AnalyticsUser, teamId: string, meetingId: string) => {
    this.track(user, 'Reflection Added', {teamId, meetingId})
  }

  meetingTimerEvent = (
    user: AnalyticsUser,
    event: 'Meeting Timer Started' | 'Meeting Timer Stopped' | 'Meeting Timer Updated',
    eventProperties: MeetingTimerEventProperties
  ) => {
    this.track(user, event, eventProperties)
  }

  pokerMeetingTeamRevoted = (
    user: AnalyticsUser,
    eventProperties: PokerMeetingTeamRevotedProperties
  ) => {
    this.track(user, 'Poker Meeting Team Revoted', eventProperties)
  }

  templateMetrics = (
    user: AnalyticsUser,
    template: MeetingTemplate,
    eventName: 'Template Created' | 'Template Cloned' | 'Template Shared'
  ) => {
    this.track(user, eventName, {
      meetingTemplateId: template.id,
      meetingTemplateType: template.type,
      meetingTemplateScope: template.scope,
      teamId: template.teamId
    })
  }

  scaleMetrics = (
    user: AnalyticsUser,
    scale: Pick<TemplateScale, 'id' | 'name' | 'teamId'>,
    eventName: 'Scale Created' | 'Scale Cloned'
  ) => {
    this.track(user, eventName, {
      scaleId: scale.id,
      scaleName: scale.name,
      teamId: scale.teamId
    })
  }

  // team
  teamNameChanged = (
    user: AnalyticsUser,
    teamId: string,
    oldName: string,
    newName: string,
    isOldNameDefault: boolean
  ) => {
    this.track(user, 'Team Name Changed', {
      teamId,
      oldName,
      newName,
      isOldNameDefault
    })
  }

  integrationAdded = (
    user: AnalyticsUser,
    teamId: string,
    service: IntegrationProviderServiceEnumType | 'slack'
  ) => {
    this.track(user, 'Integration Added', {
      teamId,
      service
    })
  }

  integrationRemoved = (
    user: AnalyticsUser,
    teamId: string,
    service: IntegrationProviderServiceEnumType | 'slack'
  ) => {
    this.track(user, 'Integration Removed', {
      teamId,
      service
    })
  }

  inviteEmailSent = (
    user: AnalyticsUser,
    teamId: string,
    inviteeEmail: string,
    isInviteeParabolUser: boolean,
    inviteTo: 'meeting' | 'team',
    success: boolean,
    isInvitedOnCreation: boolean
  ) => {
    this.track(user, 'Invite Email Sent', {
      teamId,
      inviteeEmail,
      isInviteeParabolUser,
      inviteTo,
      success,
      isInvitedOnCreation
    })
  }

  inviteAccepted = (
    user: AnalyticsUser,
    inviter: AnalyticsUser,
    teamId: string,
    isNewUser: boolean,
    acceptAt: 'meeting' | 'team'
  ) => {
    this.track(user, 'Invite Accepted', {
      teamId,
      inviterId: inviter.id,
      isNewUser,
      acceptAt
    })

    this.track(inviter, 'Sent Invite Accepted', {
      teamId,
      inviteeId: user.id,
      isNewUser,
      acceptAt
    })
  }

  joinedTeam = (user: AnalyticsUser, teamId: string) => {
    this.track(user, 'Team Joined', {
      teamId
    })
  }

  teamPrivacyChanged = (user: AnalyticsUser, teamId: string, isPublic: boolean) => {
    this.track(user, 'Team Privacy Changed', {teamId, isPublic})
  }

  //org
  clickedUpgradeCTA = (user: AnalyticsUser, upgradeCTALocation: UpgradeCTALocationEnumType) => {
    this.track(user, 'Upgrade CTA Clicked', {upgradeCTALocation})
  }

  organizationUpgradeAttempted = (user: AnalyticsUser, orgId: string) => {
    this.track(user, 'Organization Upgrade Attempted', {orgId})
  }

  organizationUpgraded = (
    user: AnalyticsUser,
    upgradeEventProperties: OrgTierChangeEventProperties
  ) => {
    this.track(user, 'Organization Upgraded', upgradeEventProperties)
  }

  organizationDowngraded = (
    user: AnalyticsUser,
    downgradeEventProperties: OrgTierChangeEventProperties
  ) => {
    this.track(user, 'Organization Downgraded', downgradeEventProperties)
  }

  // task
  taskPublished = (
    user: AnalyticsUser,
    taskProperties: TaskProperties,
    service: IntegrationProviderServiceEnumType
  ) => {
    this.track(user, 'Task Published', {
      ...taskProperties,
      service
    })
  }

  taskCreated = (user: AnalyticsUser, taskProperties: TaskProperties) => {
    this.track(user, 'Task Created', taskProperties)
  }

  taskEstimateSet = (user: AnalyticsUser, taskEstimateProperties: TaskEstimateProperties) => {
    this.track(user, 'Task Estimate Set', taskEstimateProperties)
  }

  // page
  pageCreated = (user: AnalyticsUser, pageId: number) => {
    this.track(user, 'Page Created', {pageId})
  }

  // insight
  insightGenerated = (user: AnalyticsUser, insightId: number, teamId: string) => {
    this.track(user, 'Insight Generated', {insightId, teamId})
  }

  pageInsightsGenerated = (user: AnalyticsUser) => {
    this.track(user, 'Page Insights Generated')
  }

  // user
  accountCreated = (user: AnalyticsUser, isInvited: boolean, isPatient0: boolean) => {
    this.track(user, 'Account Created', {
      isInvited,
      // properties below needed for Google Analytics goal setting
      category: 'All',
      label: isPatient0 ? 'isPatient0' : 'isNotPatient0'
    })
  }

  accountRemoved = (user: AnalyticsUser, reason: string) => {
    this.track(user, 'Account Removed', {reason})
  }

  accountPaused = (user: AnalyticsUser) => this.track(user, 'Account Paused')

  accountUnpaused = (user: AnalyticsUser) => this.track(user, 'Account Unpaused')

  accountNameChanged = (user: AnalyticsUser, newName: string) =>
    this.track(user, 'Account Name Changed', {
      newName
    })

  billingLeaderModified = (
    // Modifier
    user: AnalyticsUser,
    // id of the user being modified
    userId: string,
    orgId: string,
    modificationType: 'add' | 'remove'
  ) => {
    this.track(user, 'Billing Leader Modified', {
      viewerId: user.id,
      userId,
      orgId,
      modificationType
    })
  }

  userRemovedFromOrg = (user: AnalyticsUser, orgId: string) =>
    this.track(user, 'User Removed From Org', {user: user.id, orgId})

  websocketConnected = (user: AnalyticsUser, websocketProperties: WebSocketProperties) => {
    this.track(user, 'Connect WebSocket', websocketProperties)
  }

  websocketDisconnected = (user: AnalyticsUser, websocketProperties: WebSocketProperties) => {
    this.track(user, 'Disconnect WebSocket', websocketProperties)
  }

  toggleSubToSummaryEmail = (user: AnalyticsUser, subscribeToSummaryEmail: boolean) => {
    this.track(user, 'Summary Email Setting Changed', {subscribeToSummaryEmail})
  }

  notificationEmailSent = (user: AnalyticsUser, orgId: string, type: TeamLimitsEmailType) => {
    this.track(user, 'Notification Email Sent', {type, orgId})
  }

  suggestedGroupsGenerated = (user: AnalyticsUser, meetingId: string, teamId: string) => {
    this.track(user, 'Suggested Groups Generated', {meetingId, teamId})
  }

  suggestGroupsClicked = (user: AnalyticsUser, meetingId: string, teamId: string) => {
    this.track(user, 'Suggest Groups Clicked', {meetingId, teamId})
  }

  resetGroupsClicked = (user: AnalyticsUser, meetingId: string, teamId: string) => {
    this.track(user, 'Reset Groups Clicked', {meetingId, teamId})
  }

  conversionModalPayLaterClicked = (user: AnalyticsUser) => {
    this.track(user, 'Conversion Modal Pay Later Clicked')
  }

  addedAgendaItem = (user: AnalyticsUser, teamId: string, meetingId?: string) => {
    this.track(user, 'Added Agenda Item', {teamId, meetingId})
  }

  archiveOrganization = (user: AnalyticsUser, orgId: string) => {
    this.track(user, 'Archive Organization', {orgId})
  }

  archiveTeam = (user: AnalyticsUser, teamId: string) => {
    this.track(user, 'Archive Team', {teamId})
  }

  enterpriseOverUserLimit = (user: AnalyticsUser, orgId: string) => {
    this.track(user, 'Enterprise Over User Limit', {orgId})
  }

  lockedUserAttemptToJoinTeam = (user: AnalyticsUser, invitingOrgId: string) => {
    this.track(user, 'Locked user attempted to join a team', {invitingOrgId})
  }

  mattermostNotificationSent = (
    user: AnalyticsUser,
    teamId: string,
    notificationEvent: SlackNotification['event']
  ) => {
    this.track(user, 'Mattermost notification sent', {teamId, notificationEvent})
  }

  mentionedOnTask = (user: AnalyticsUser, mentionedUserId: string, teamId: string) => {
    this.track(user, 'Mentioned on Task', {mentionedUserId, teamId})
  }

  teamsNotificationSent = (
    user: AnalyticsUser,
    teamId: string,
    notificationEvent: SlackNotification['event']
  ) => {
    this.track(user, 'MSTeams notification sent', {teamId, notificationEvent})
  }

  newOrg = (user: AnalyticsUser, orgId: string, teamId: string, fromSignup: boolean) => {
    this.track(user, 'New Org', {orgId, teamId, fromSignup})
  }

  newTeam = (user: AnalyticsUser, orgId: string, teamId: string, teamNumber: number) => {
    this.track(user, 'New Team', {orgId, teamId, teamNumber})
  }

  pollAdded = (user: AnalyticsUser, teamId: string, meetingId: string) => {
    this.track(user, 'Poll added', {meetingId, teamId})
  }

  slackNotificationSent = (
    user: AnalyticsUser,
    teamId: string,
    notificationEvent: SlackNotification['event'],
    reflectionGroupId?: string
  ) => {
    this.track(user, 'Slack notification sent', {teamId, notificationEvent, reflectionGroupId})
  }

  smartGroupTitleChanged = (
    user: AnalyticsUser,
    similarity: number,
    smartTitle: string,
    normalizedTitle: string
  ) => {
    this.track(user, 'Smart group title changed', {
      similarity,
      smartTitle,
      title: normalizedTitle
    })
  }

  taskDueDateSet = (user: AnalyticsUser, teamId: string, taskId: string) => {
    this.track(user, 'Task due date set', {taskId, teamId})
  }

  autoJoined = (user: AnalyticsUser, teamId: string) => {
    this.track(user, 'AutoJoined Team', {userId: user.id, teamId})
  }

  icebreakerModified = (
    user: AnalyticsUser,
    meetingId: string,
    modifyType: ModifyType,
    success: boolean
  ) => {
    this.track(user, 'Icebreaker Modified', {
      userId: user.id,
      meetingId,
      modifyType,
      success
    })
  }

  insightsFeedbackSubmitted = (
    user: AnalyticsUser,
    isUseful: boolean,
    feedback: string,
    canEmail: boolean
  ) => {
    this.track(user, 'Insights Feedback Submitted', {
      isUseful,
      feedback,
      canEmail
    })
  }

  identify = (options: IdentifyOptions) => {
    this.amplitudeAnalytics.identify(options)
  }

  private track = (
    user: AnalyticsUser,
    event: AnalyticsEvent,
    properties?: Record<string, any>
  ) => {
    const {id, email} = user
    this.amplitudeAnalytics.track(id, email, event, properties)
  }
}

export const analytics = new Analytics()
