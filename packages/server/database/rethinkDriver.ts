import {MasterPool, r} from 'rethinkdb-ts'
import SlackAuth from '../database/types/SlackAuth'
import SlackNotification from '../database/types/SlackNotification'
import TeamInvitation from '../database/types/TeamInvitation'
import TeamMember from '../database/types/TeamMember'
import {AnyMeeting, AnyMeetingSettings, AnyMeetingTeamMember} from '../postgres/types/Meeting'
import {ScheduledJobUnion} from '../types/custom'
import getRethinkConfig from './getRethinkConfig'
import {R} from './stricterR'
import AgendaItem from './types/AgendaItem'
import AtlassianAuth from './types/AtlassianAuth'
import Comment from './types/Comment'
import FailedAuthRequest from './types/FailedAuthRequest'
import Invoice from './types/Invoice'
import InvoiceItemHook from './types/InvoiceItemHook'
import MassInvitation from './types/MassInvitation'
import MeetingTemplate from './types/MeetingTemplate'
import NotificationKickedOut from './types/NotificationKickedOut'
import NotificationMeetingStageTimeLimitEnd from './types/NotificationMeetingStageTimeLimitEnd'
import NotificationMentioned from './types/NotificationMentioned'
import NotificationPaymentRejected from './types/NotificationPaymentRejected'
import NotificationPromoteToBillingLeader from './types/NotificationPromoteToBillingLeader'
import NotificationResponseMentioned from './types/NotificationResponseMentioned'
import NotificationResponseReplied from './types/NotificationResponseReplied'
import NotificationTaskInvolves from './types/NotificationTaskInvolves'
import NotificationTeamArchived from './types/NotificationTeamArchived'
import NotificationTeamInvitation from './types/NotificationTeamInvitation'
import PasswordResetRequest from './types/PasswordResetRequest'
import PushInvitation from './types/PushInvitation'
import RetrospectivePrompt from './types/RetrospectivePrompt'
import SuggestedActionCreateNewTeam from './types/SuggestedActionCreateNewTeam'
import SuggestedActionInviteYourTeam from './types/SuggestedActionInviteYourTeam'
import SuggestedActionTryTheDemo from './types/SuggestedActionTryTheDemo'
import Task from './types/Task'
import TemplateDimension from './types/TemplateDimension'
import TemplateScale from './types/TemplateScale'

export type RethinkSchema = {
  AgendaItem: {
    type: AgendaItem
    index: 'teamId' | 'meetingId'
  }
  AtlassianAuth: {
    type: AtlassianAuth
    index: 'atlassianUserId' | 'userId' | 'teamId'
  }
  Comment: {
    type: Comment
    index: 'discussionId'
  }
  ReflectPrompt: {
    type: RetrospectivePrompt
    index: 'teamId' | 'templateId'
  }
  EmailVerification: {
    type: any
    index: 'email' | 'token'
  }
  FailedAuthRequest: {
    type: FailedAuthRequest
    index: 'email' | 'ip'
  }
  GQLRequest: {
    type: any
    index: 'id'
  }
  Invoice: {
    type: Invoice
    index: 'orgIdStartAt'
  }
  InvoiceItemHook: {
    type: InvoiceItemHook
    index: 'prorationDate' | 'stripeSubscriptionId'
  }
  MassInvitation: {
    type: MassInvitation
    index: 'teamMemberId'
  }
  MeetingSettings: {
    type: AnyMeetingSettings
    index: 'teamId'
  }
  MeetingMember: {
    type: AnyMeetingTeamMember
    index: 'meetingId' | 'teamId' | 'userId'
  }
  NewMeeting: {
    type: AnyMeeting
    index:
      | 'facilitatorUserId'
      | 'teamId'
      | 'templateId'
      | 'meetingSeriesId'
      | 'hasEndedScheduledEndTime'
  }
  NewFeature: {
    type: any
    index: ''
  }
  Notification: {
    type:
      | NotificationTaskInvolves
      | NotificationTeamArchived
      | NotificationMeetingStageTimeLimitEnd
      | NotificationPaymentRejected
      | NotificationKickedOut
      | NotificationPromoteToBillingLeader
      | NotificationTeamInvitation
      | NotificationResponseMentioned
      | NotificationResponseReplied
      | NotificationMentioned
    index: 'userId'
  }
  PasswordResetRequest: {
    type: PasswordResetRequest
    index: 'email' | 'ip' | 'token'
  }
  PushInvitation: {
    type: PushInvitation
    index: 'userId'
  }
  MeetingTemplate: {
    type: MeetingTemplate
    index: 'teamId' | 'orgId'
  }
  ScheduledJob: {
    type: ScheduledJobUnion
    index: 'runAt' | 'type'
  }
  SlackAuth: {
    type: SlackAuth
    index: 'teamId' | 'userId'
  }
  SlackNotification: {
    type: SlackNotification
    index: 'teamId' | 'userId'
  }
  SuggestedAction: {
    // tryRetroMeeting = 'tryRetroMeeting',
    // tryActionMeeting = 'tryActionMeeting'
    type: SuggestedActionCreateNewTeam | SuggestedActionInviteYourTeam | SuggestedActionTryTheDemo
    index: 'userId' | 'teamId'
  }
  Task: {
    type: Task
    index:
      | 'integrationId'
      | 'tags'
      | 'teamId'
      | 'teamIdUpdatedAt'
      | 'discussionId'
      | 'userId'
      | 'integrationHash'
  }
  TeamInvitation: {
    type: TeamInvitation
    index: 'email' | 'teamId' | 'token'
  }
  TeamMember: {
    type: TeamMember
    index: 'teamId' | 'userId'
  }
  TemplateDimension: {
    type: TemplateDimension
    index: 'teamId' | 'templateId' | 'scaleId'
  }
  TemplateScale: {
    type: TemplateScale
    index: 'teamId'
  }
}

export type DBType = {
  [P in keyof RethinkSchema]: RethinkSchema[P]['type']
}

export type ParabolR = R<RethinkSchema>
const config = getRethinkConfig()
let isLoading = false
let isLoaded = false
let promise: Promise<MasterPool> | undefined
const getRethink = async () => {
  if (!isLoaded) {
    if (!isLoading) {
      isLoading = true
      promise = r.connectPool(config)
    }
    await promise
    isLoaded = true
  }
  // this is important because pm2 will restart the process & for whatever reason r isn't always healthy
  await r.waitForHealthy()
  return r as unknown as ParabolR
}

export const closeRethink = async () => {
  if (promise) {
    await (await promise).drain()
    isLoaded = false
    isLoading = false
    promise = undefined
  }
}

export default getRethink
