import {GraphQLObjectType} from 'graphql';
import {resolveOrgApproval} from 'server/graphql/resolvers';
import NotifyRequestNewUser from 'server/graphql/types/NotifyRequestNewUser';
import OrgApproval from 'server/graphql/types/OrgApproval';

const CancelApprovalPayload = new GraphQLObjectType({
  name: 'CancelApprovalPayload',
  fields: () => ({
    orgApproval: {
      type: OrgApproval,
      description: 'The inactivated org approval',
      resolve: resolveOrgApproval
    },
    removedRequestNotification: {
      type: NotifyRequestNewUser,
      description: 'The notification requesting org approval to the org leader'
    }
  })
});

export default CancelApprovalPayload;
