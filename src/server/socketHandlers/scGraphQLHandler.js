import {graphql} from 'graphql';
import Schema from 'server/graphql/rootSchema';

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
    cb(null, result);
  };
}
