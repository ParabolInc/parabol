import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import ApproveToOrgPayload from 'server/graphql/types/ApproveToOrgPayload';
import CancelApprovalPayload from 'server/graphql/types/CancelApprovalPayload';
import InviteTeamMembersPayload from 'server/graphql/types/InviteTeamMembersPayload';
import RejectOrgApprovalPayload from 'server/graphql/types/RejectOrgApprovalPayload';

const types = [
  ApproveToOrgPayload,
  CancelApprovalPayload,
  InviteTeamMembersPayload,
  RejectOrgApprovalPayload
];

export default new GraphQLSubscriptionType('OrgApprovalSubscriptionPayload', types);
