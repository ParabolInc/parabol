import {GraphQLID, GraphQLInterfaceType} from 'graphql';
import NotificationEnum from 'server/graphql/types/NotificationEnum';
import NotifyPaymentRejected from 'server/graphql/types/NotifyPaymentRejected';
import NotifyPromoteToOrgLeader from 'server/graphql/types/NotifyPromoteToOrgLeader';
import NotifyRequestNewUser from 'server/graphql/types/NotifyRequestNewUser';
import {PAYMENT_REJECTED, PROMOTE_TO_BILLING_LEADER, REQUEST_NEW_USER} from 'universal/utils/constants';

const OrganizationNotification = new GraphQLInterfaceType({
  name: 'OrganizationNotification',
  fields: {
    id: {
      type: GraphQLID
    },
    type: {
      type: NotificationEnum
    }
  },
  resolveType({type}) {
    const resolveTypeLookup = {
      [PAYMENT_REJECTED]: NotifyPaymentRejected,
      [REQUEST_NEW_USER]: NotifyRequestNewUser,
      [PROMOTE_TO_BILLING_LEADER]: NotifyPromoteToOrgLeader
    };

    return resolveTypeLookup[type];
  }
});

export default OrganizationNotification;
