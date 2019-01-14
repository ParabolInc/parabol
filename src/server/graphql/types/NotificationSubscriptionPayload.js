import graphQLSubscriptionType from 'server/graphql/graphQLSubscriptionType'
import AddOrgPayload from 'server/graphql/types/AddOrgPayload'
import AddTeamPayload from 'server/graphql/types/AddTeamPayload'
import ApproveToOrgPayload from 'server/graphql/types/ApproveToOrgPayload'
import CancelApprovalPayload from 'server/graphql/types/CancelApprovalPayload'
import ClearNotificationPayload from 'server/graphql/types/ClearNotificationPayload'
import CreateTaskPayload from 'server/graphql/types/CreateTaskPayload'
import DeleteTaskPayload from 'server/graphql/types/DeleteTaskPayload'
import InviteTeamMembersPayload from 'server/graphql/types/InviteTeamMembersPayload'
import RejectOrgApprovalPayload from 'server/graphql/types/RejectOrgApprovalPayload'
import StripeFailPaymentPayload from 'server/graphql/types/StripeFailPaymentPayload'
import User from 'server/graphql/types/User'
import RemoveOrgUserPayload from 'server/graphql/types/RemoveOrgUserPayload'
import UpdateUserProfilePayload from 'server/graphql/types/UpdateUserProfilePayload'
import DisconnectSocketPayload from 'server/graphql/types/DisconnectSocketPayload'
import AddFeatureFlagPayload from 'server/graphql/types/AddFeatureFlagPayload'
import InviteToTeamPayload from 'server/graphql/types/InviteToTeamPayload'
import AcceptTeamInvitationPayload from 'server/graphql/types/AcceptTeamInvitationPayload'

const types = [
  AcceptTeamInvitationPayload,
  AddFeatureFlagPayload,
  AddOrgPayload,
  AddTeamPayload,
  ApproveToOrgPayload,
  CancelApprovalPayload,
  ClearNotificationPayload,
  CreateTaskPayload,
  DeleteTaskPayload,
  DisconnectSocketPayload,
  InviteTeamMembersPayload,
  InviteToTeamPayload,
  RejectOrgApprovalPayload,
  RemoveOrgUserPayload,
  StripeFailPaymentPayload,
  // User doesn't have an error field, either make an exception & add it (because it's the Viewer) or use a payload here
  User,
  UpdateUserProfilePayload
]

export default graphQLSubscriptionType('NotificationSubscriptionPayload', types)
