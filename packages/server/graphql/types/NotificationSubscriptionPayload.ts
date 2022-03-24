import graphQLSubscriptionType from '../graphQLSubscriptionType'
import AcceptTeamInvitationPayload from './AcceptTeamInvitationPayload'
import AddFeatureFlagPayload from './AddFeatureFlagPayload'
import AddNewFeaturePayload from './addNewFeaturePayload'
import AddOrgPayload from './AddOrgPayload'
import AddTeamPayload from './AddTeamPayload'
import {ArchiveTimelineEventSuccess} from './ArchiveTimelineEventPayload'
import AuthTokenPayload from './AuthTokenPayload'
import CreateTaskPayload from './CreateTaskPayload'
import DeleteTaskPayload from './DeleteTaskPayload'
import DisconnectSocketPayload from './DisconnectSocketPayload'
import {EndCheckInSuccess} from './EndCheckInPayload'
import EndNewMeetingPayload from './EndNewMeetingPayload'
import {EndRetrospectiveSuccess} from './EndRetrospectivePayload'
import InvalidateSessionsPayload from './InvalidateSessionsPayload'
import InviteToTeamPayload from './InviteToTeamPayload'
import JiraIssue from './JiraIssue'
import MeetingStageTimeLimitPayload from './MeetingStageTimeLimitPayload'
import {PersistGitHubSearchQuerySuccess} from './PersistGitHubSearchQueryPayload'
import {PersistJiraSearchQuerySuccess} from './PersistJiraSearchQueryPayload'
import RemoveOrgUserPayload from './RemoveOrgUserPayload'
import SetNotificationStatusPayload from './SetNotificationStatusPayload'
import StripeFailPaymentPayload from './StripeFailPaymentPayload'
import User from './User'

const types = [
  AcceptTeamInvitationPayload,
  AddFeatureFlagPayload,
  AddNewFeaturePayload,
  AddOrgPayload,
  AddTeamPayload,
  ArchiveTimelineEventSuccess,
  SetNotificationStatusPayload,
  CreateTaskPayload,
  DeleteTaskPayload,
  DisconnectSocketPayload,
  EndNewMeetingPayload,
  EndCheckInSuccess,
  EndRetrospectiveSuccess,
  InvalidateSessionsPayload,
  InviteToTeamPayload,
  MeetingStageTimeLimitPayload,
  RemoveOrgUserPayload,
  StripeFailPaymentPayload,
  PersistJiraSearchQuerySuccess,
  // User doesn't have an error field, either make an exception & add it (because it's the Viewer) or use a payload here
  User,
  // a one off used so the server can sniff it & update its connection context
  AuthTokenPayload,
  PersistGitHubSearchQuerySuccess,
  JiraIssue
]

export default graphQLSubscriptionType('NotificationSubscriptionPayload', types)
