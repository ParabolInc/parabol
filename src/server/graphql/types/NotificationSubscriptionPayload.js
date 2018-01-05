import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import ApproveToOrgPayload from 'server/graphql/types/ApproveToOrgPayload';
import CancelApprovalPayload from 'server/graphql/types/CancelApprovalPayload';
import CancelTeamInvitePayload from 'server/graphql/types/CancelTeamInvitePayload';
import ClearNotificationPayload from 'server/graphql/types/ClearNotificationPayload';
import CreateProjectPayload from 'server/graphql/types/CreateProjectPayload';
import DeleteProjectPayload from 'server/graphql/types/DeleteProjectPayload';
import InviteTeamMembersPayload from 'server/graphql/types/InviteTeamMembersPayload';
import NotifyVersionInfo from 'server/graphql/types/NotifyVersionInfo';
import RejectOrgApprovalPayload from 'server/graphql/types/RejectOrgApprovalPayload';
import StripeFailPaymentPayload from 'server/graphql/types/StripeFailPaymentPayload';
import User from 'server/graphql/types/User';

const types = [
  ApproveToOrgPayload,
  CancelApprovalPayload,
  CancelTeamInvitePayload,
  ClearNotificationPayload,
  CreateProjectPayload,
  DeleteProjectPayload,
  InviteTeamMembersPayload,
  RejectOrgApprovalPayload,
  StripeFailPaymentPayload,
  User,
  NotifyVersionInfo
];

export default new GraphQLSubscriptionType('NotificationSubscriptionPayload', types);
