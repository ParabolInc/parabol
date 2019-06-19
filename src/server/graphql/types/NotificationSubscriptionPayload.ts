import graphQLSubscriptionType from 'server/graphql/graphQLSubscriptionType'
import AddOrgPayload from 'server/graphql/types/AddOrgPayload'
import AddTeamPayload from 'server/graphql/types/AddTeamPayload'
import ClearNotificationPayload from 'server/graphql/types/ClearNotificationPayload'
import CreateTaskPayload from 'server/graphql/types/CreateTaskPayload'
import DeleteTaskPayload from 'server/graphql/types/DeleteTaskPayload'
import StripeFailPaymentPayload from 'server/graphql/types/StripeFailPaymentPayload'
import User from 'server/graphql/types/User'
import RemoveOrgUserPayload from 'server/graphql/types/RemoveOrgUserPayload'
import DisconnectSocketPayload from 'server/graphql/types/DisconnectSocketPayload'
import AddFeatureFlagPayload from 'server/graphql/types/AddFeatureFlagPayload'
import InviteToTeamPayload from 'server/graphql/types/InviteToTeamPayload'
import AcceptTeamInvitationPayload from 'server/graphql/types/AcceptTeamInvitationPayload'
import EndNewMeetingPayload from 'server/graphql/types/EndNewMeetingPayload'
import AddNewFeaturePayload from 'server/graphql/types/addNewFeaturePayload'
import MeetingStageTimeLimitPayload from 'server/graphql/types/MeetingStageTimeLimitPayload'

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
