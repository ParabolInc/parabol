import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import ApproveToOrgPayload from 'server/graphql/types/ApproveToOrgPayload';
import CancelApprovalPayload from 'server/graphql/types/CancelApprovalPayload';
import CancelTeamInvitePayload from 'server/graphql/types/CancelTeamInvitePayload';
import ClearNotificationPayload from 'server/graphql/types/ClearNotificationPayload';
import NotifyVersionInfo from 'server/graphql/types/NotifyVersionInfo';
import User from 'server/graphql/types/User';

const types = [
  ApproveToOrgPayload,
  CancelApprovalPayload,
  CancelTeamInvitePayload,
  ClearNotificationPayload,
  User,
  NotifyVersionInfo
];

export default new GraphQLSubscriptionType('NotificationSubscriptionPayload', types);
