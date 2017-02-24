// import getRethink from 'server/database/rethinkDriver';
// import {GraphQLNonNull, GraphQLID, GraphQLList} from 'graphql';
// import getRequestedFields from 'server/graphql/getRequestedFields';
// import {Invoice} from './invoiceSchema';
// import {getUserId, getUserOrgDoc, requireOrgLeader} from 'server/utils/authorization';
// import makeChangefeedHandler from 'server/utils/makeChangefeedHandler';
//
// export default {
//   invoices: {
//     type: new GraphQLList(Invoice),
//     args: {
//       orgId: {
//         type: new GraphQLNonNull(GraphQLID),
//         description: 'The unique org ID that owns the invoices'
//       }
//     },
//     async resolve(source, {teamId}, {authToken, socket, subbedChannelName}, refs) {
//       const r = getRethink();
//
//       // AUTH
//       const userId = getUserId(authToken);
//       const userOrgDoc = await getUserOrgDoc(userId, orgId);
//       requireOrgLeader(userOrgDoc);
//
//       // RESOLUTION
//       const requestedFields = getRequestedFields(refs);
//       const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName);
//       r.table('Invoice')
//         .getAll(orgId, {index: 'orgId'})
//         .
//         .filter({isActive: true})
//         .pluck(requestedFields)
//         .changes({includeInitial: true})
//         .run({cursor: true}, changefeedHandler);
//     }
//   }
// };
