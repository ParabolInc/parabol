import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLList
} from 'graphql';
import {Invoice} from './invoiceSchema';
import {getUserId, getUserOrgDoc, requireOrgLeader} from 'server/utils/authorization';

export default {
  invoiceList: {
    type: new GraphQLList(new GraphQLNonNull(Invoice)),
    args: {
      orgId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The id of the organization'
      },
      after: {type: GraphQLString, description: 'the cursor coming from the front'},
      first: {type: GraphQLInt, description: "Limit the invoices from the front"},
    },
    async resolve(source, {orgId, after, first}, {authToken}) {
      const r = getRethink();

      // AUTH
      const userId = getUserId(authToken);
      const userOrgDoc = await getUserOrgDoc(userId, orgId);
      requireOrgLeader(userOrgDoc);

      // RESOLUTION
      const cursor = after || r.minval;
      return await r.table('Invoice')
        .between([orgId, cursor], [orgId, r.maxval], {index: 'orgIdStartAt', leftBound: 'open'})
        .orderBy(r.desc('startAt'))
        .limit(first)
        .merge((doc) => ({
          cursor: doc('startAt')
        }))
    }
  }
};
