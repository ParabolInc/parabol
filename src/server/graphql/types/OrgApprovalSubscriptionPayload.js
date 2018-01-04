import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import ApproveToOrgPayload from 'server/graphql/types/ApproveToOrgPayload';
import CancelApprovalPayload from 'server/graphql/types/CancelApprovalPayload';

const types = [
  ApproveToOrgPayload,
  CancelApprovalPayload
];

export default new GraphQLSubscriptionType('OrgApprovalSubscriptionPayload', types);
