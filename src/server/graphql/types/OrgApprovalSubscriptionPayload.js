import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import ApproveToOrgPayload from 'server/graphql/types/ApproveToOrgPayload';
import CancelApprovalPayload from 'server/graphql/types/CancelApprovalPayload';
import InviteTeamMembersPayload from 'server/graphql/types/InviteTeamMembersPayload';
import RejectOrgApprovalInviterPayload from 'server/graphql/types/RejectOrgApprovalInviterPayload';
import RejectOrgApprovalOrgLeaderPayload from 'server/graphql/types/RejectOrgApprovalOrgLeaderPayload';

const types = [
  ApproveToOrgPayload,
  CancelApprovalPayload,
  InviteTeamMembersPayload,
  RejectOrgApprovalInviterPayload,
  RejectOrgApprovalOrgLeaderPayload
];

export default new GraphQLSubscriptionType('OrgApprovalSubscriptionPayload', types);
