import {graphql} from 'graphql';
import Schema from 'server/graphql/rootSchema';

// const mutations = Schema._mutationType && Schema._mutationType._fields || {};
// const whitelist = [
//   'addBilling',
//   'createOrgPicturePutUrl',
//   'createUserPicturePutUrl',
//   'orgDetails',
//   'updateOrg',
//   'updateUserProfile',
//   'summarizeMeeting'
// ];
// const mutationNames = Object.keys(mutations);
const blacklist = [];

export default function wsGraphQLHandler(exchange, socket) {
  return async function graphQLHandler(body, cb) {
    const {query, variables} = body;
    const authToken = socket.getAuthToken();
    const context = {
      authToken,
      exchange,
      socket
    };
    // response = {errors, data}
    const result = await graphql(Schema, query, {}, context, variables);
    if (result.errors) {
      console.log('DEBUG GraphQL Error:', result.errors);
    }
    const resolvedQueries = Object.keys(result.data);
    const firstQuery = resolvedQueries[0];
    const clientValue = blacklist.includes(firstQuery) ? true : result;
    cb(null, clientValue);
  };
}
