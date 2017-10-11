import getRethink from 'server/database/rethinkDriver';
import {GraphQLNonNull, GraphQLID} from 'graphql';
import {getUserId, getUserOrgDoc, requireOrgLeader} from 'server/utils/authorization';
import makeUpcomingInvoice from '../../queries/helpers/makeUpcomingInvoice';
import Invoice from 'server/graphql/types/Invoice';

export default {
  upcomingInvoice: {
    type: Invoice,
    args: {
      orgId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique org ID that owns the invoice'
      }
    },
    async resolve(source, {orgId}, {authToken, socket, subbedChannelName}) {
      const r = getRethink();

      // AUTH
      const userId = getUserId(authToken);
      const userOrgDoc = await getUserOrgDoc(userId, orgId);
      requireOrgLeader(userOrgDoc);

      // RESOLUTION
      const {stripeId, stripeSubscriptionId} = await r.table('Organization').get(orgId)
        .pluck('stripeId', 'stripeSubscriptionId');
      const upcomingInvoice = await makeUpcomingInvoice(orgId, stripeId, stripeSubscriptionId);
      const payload = {
        type: 'add',
        fields: upcomingInvoice
      };
      socket.emit(subbedChannelName, payload);
    }
  }
};
