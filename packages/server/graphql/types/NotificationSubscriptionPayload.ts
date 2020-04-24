import graphQLSubscriptionType from '../graphQLSubscriptionType'
import AddOrgPayload from './AddOrgPayload'
import AddTeamPayload from './AddTeamPayload'
import SetNotificationStatusPayload from './SetNotificationStatusPayload'
import CreateTaskPayload from './CreateTaskPayload'
import DeleteTaskPayload from './DeleteTaskPayload'
import StripeFailPaymentPayload from './StripeFailPaymentPayload'
import User from './User'
import RemoveOrgUserPayload from './RemoveOrgUserPayload'
import DisconnectSocketPayload from './DisconnectSocketPayload'
import AddFeatureFlagPayload from './AddFeatureFlagPayload'
import InviteToTeamPayload from './InviteToTeamPayload'
import AcceptTeamInvitationPayload from './AcceptTeamInvitationPayload'
import EndNewMeetingPayload from './EndNewMeetingPayload'
import AddNewFeaturePayload from './addNewFeaturePayload'
import MeetingStageTimeLimitPayload from './MeetingStageTimeLimitPayload'
import AuthTokenPayload from './AuthTokenPayload'
import InvalidateSessionsPayload from './InvalidateSessionsPayload'

const types = [
  AcceptTeamInvitationPayload,
  AddFeatureFlagPayload,
  AddNewFeaturePayload,
  AddOrgPayload,
  AddTeamPayload,
  SetNotificationStatusPayload,
  CreateTaskPayload,
  DeleteTaskPayload,
  DisconnectSocketPayload,
  EndNewMeetingPayload,
  InvalidateSessionsPayload,
  InviteToTeamPayload,
  MeetingStageTimeLimitPayload,
  RemoveOrgUserPayload,
  StripeFailPaymentPayload,
  // User doesn't have an error field, either make an exception & add it (because it's the Viewer) or use a payload here
  User,
  // a one off used so the server can sniff it & update its connection context
  AuthTokenPayload
]

export default graphQLSubscriptionType('NotificationSubscriptionPayload', types)
