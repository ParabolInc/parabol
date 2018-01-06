import {GraphQLObjectType} from 'graphql';
import {resolveNotificationForViewer} from 'server/graphql/resolvers';
import NotifyDenial from 'server/graphql/types/NotifyDenial';
import RejectOrgApprovalPayload from 'server/graphql/types/RejectOrgApprovalPayload';
import {rejectOrgApprovalFields} from 'server/graphql/types/RejectOrgApprovalPayload';

const RejectOrgApprovalInviterPayload = new GraphQLObjectType({
  name: 'RejectOrgApprovalInviterPayload',
  interfaces: () => [RejectOrgApprovalPayload],
  fields: () => ({
    ...rejectOrgApprovalFields,
    deniedNotification: {
      type: NotifyDenial,
      description: 'The notification going to the inviter saying their invitee has been denied',
      resolve: resolveNotificationForViewer
    }
  })
});

export default RejectOrgApprovalInviterPayload;
