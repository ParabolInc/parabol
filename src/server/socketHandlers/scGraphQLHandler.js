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
    const {errors, data} = await graphql(Schema, query, {}, context, variables);
    if (errors) {
      // don't send data if we have an error
      cb(errors);
    } else {
      cb(null, data);
    }
  };
};
