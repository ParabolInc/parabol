import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import ApproveToOrgPayload from 'server/graphql/types/ApproveToOrgPayload';

const types = [
  ApproveToOrgPayload
];

export default new GraphQLSubscriptionType('NotificationSubscriptionPayload', types);
