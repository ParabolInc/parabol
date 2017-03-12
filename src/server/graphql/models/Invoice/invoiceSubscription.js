import getRethink from 'server/database/rethinkDriver';
import {GraphQLNonNull, GraphQLID} from 'graphql';
import {Invoice} from './invoiceSchema';
import {getUserId, getUserOrgDoc, requireOrgLeader} from 'server/utils/authorization';
import makeUpcomingInvoice from './makeUpcomingInvoice';

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
      const stripeId = await r.table('Organization').get(orgId)('stripeId');
      const upcomingInvoice = await makeUpcomingInvoice(orgId, stripeId);
      const payload = {
        type: 'add',
        fields: upcomingInvoice
      };
      socket.emit(subbedChannelName, payload);
    }
  }
};
