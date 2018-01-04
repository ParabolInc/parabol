import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import AddOrgPayload from 'server/graphql/types/AddOrgPayload';
import ApproveToOrgPayload from 'server/graphql/types/ApproveToOrgPayload';

const types = [
  AddOrgPayload,
  ApproveToOrgPayload
];

export default new GraphQLSubscriptionType('OrganizationSubscriptionPayload', types);
