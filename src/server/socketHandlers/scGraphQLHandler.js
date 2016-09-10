import {graphql} from 'graphql';
import Schema from 'server/graphql/rootSchema';

// eslint-disable-next-line no-underscore-dangle
const mutations = Schema._mutationType && Schema._mutationType._fields || {};
const mutationNames = Object.keys(mutations);

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
    if (resolvedQueries.length !== 1 || !mutationNames.includes(resolvedQueries[0])) {
      cb(null, result);
    }
  };
}
