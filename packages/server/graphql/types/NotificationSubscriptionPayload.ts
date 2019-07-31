import graphQLSubscriptionType from '../graphQLSubscriptionType'
import AddOrgPayload from './AddOrgPayload'
import AddTeamPayload from './AddTeamPayload'
import ClearNotificationPayload from './ClearNotificationPayload'
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

const types = [
  AcceptTeamInvitationPayload,
  AddFeatureFlagPayload,
  AddNewFeaturePayload,
  AddOrgPayload,
  AddTeamPayload,
  ClearNotificationPayload,
  CreateTaskPayload,
  DeleteTaskPayload,
  DisconnectSocketPayload,
  EndNewMeetingPayload,
  InviteToTeamPayload,
  MeetingStageTimeLimitPayload,
  RemoveOrgUserPayload,
  StripeFailPaymentPayload,
  // User doesn't have an error field, either make an exception & add it (because it's the Viewer) or use a payload here
  User
]

export default graphQLSubscriptionType('NotificationSubscriptionPayload', types)
