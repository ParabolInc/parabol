import {GraphQLID, GraphQLInterfaceType} from 'graphql';
import NotifyInvitation from 'server/graphql/types/NotifyInvitation';
import NotifyPaymentRejected from 'server/graphql/types/NotifyPaymentRejected';
import NotifyPromoteToOrgLeader from 'server/graphql/types/NotifyPromoteToOrgLeader';

import {PAYMENT_REJECTED, PROMOTE_TO_BILLING_LEADER, REQUEST_NEW_USER} from 'universal/utils/constants';

const OrganizationAddedNotification = new GraphQLInterfaceType({
  name: 'OrganizationAddedNotification',
  fields: {
    id: {
      type: GraphQLID
    }
  },
  resolveType({type}) {
    const resolveTypeLookup = {
      [PAYMENT_REJECTED]: NotifyPaymentRejected,
      [REQUEST_NEW_USER]: NotifyInvitation,
      [PROMOTE_TO_BILLING_LEADER]: NotifyPromoteToOrgLeader
    };

    return resolveTypeLookup[type];
  }
});

export default OrganizationAddedNotification;
