import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import AddOrgPayload from 'server/graphql/types/AddOrgPayload';
import AddTeamPayload from 'server/graphql/types/AddTeamPayload';
import ApproveToOrgPayload from 'server/graphql/types/ApproveToOrgPayload';
import CancelApprovalPayload from 'server/graphql/types/CancelApprovalPayload';
import CancelTeamInvitePayload from 'server/graphql/types/CancelTeamInvitePayload';
import ClearNotificationPayload from 'server/graphql/types/ClearNotificationPayload';
import CreateProjectPayload from 'server/graphql/types/CreateProjectPayload';
import DeleteProjectPayload from 'server/graphql/types/DeleteProjectPayload';
import InviteTeamMembersInviteePayload from 'server/graphql/types/InviteTeamMembersInviteePayload';
import InviteTeamMembersOrgLeaderPayload from 'server/graphql/types/InviteTeamMembersOrgLeaderPayload';
import NotifyVersionInfo from 'server/graphql/types/NotifyVersionInfo';
import RejectOrgApprovalInviterPayload from 'server/graphql/types/RejectOrgApprovalInviterPayload';
import RejectOrgApprovalOrgLeaderPayload from 'server/graphql/types/RejectOrgApprovalOrgLeaderPayload';
import StripeFailPaymentPayload from 'server/graphql/types/StripeFailPaymentPayload';
import User from 'server/graphql/types/User';

const types = [
  AddOrgPayload,
  AddTeamPayload,
  ApproveToOrgPayload,
  CancelApprovalPayload,
  CancelTeamInvitePayload,
  ClearNotificationPayload,
  CreateProjectPayload,
  DeleteProjectPayload,
  InviteTeamMembersInviteePayload,
  InviteTeamMembersOrgLeaderPayload,
  RejectOrgApprovalInviterPayload,
  RejectOrgApprovalOrgLeaderPayload,
  StripeFailPaymentPayload,
  User,
  NotifyVersionInfo
];

export default new GraphQLSubscriptionType('NotificationSubscriptionPayload', types);
