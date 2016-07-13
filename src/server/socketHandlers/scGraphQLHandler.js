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
    const response = await graphql(Schema, query, {}, context, variables);
    cb(response);
  };
};
