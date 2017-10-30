import {graphql} from 'graphql';
import Schema from 'server/graphql/rootSchema';
import RethinkDataLoader from 'server/utils/RethinkDataLoader';

export default function wsGraphQLHandler(exchange, socket) {
  return async function graphQLHandler(body, cb) {
    const {query, variables} = body;
    const authToken = socket.getAuthToken();
    const context = {
      authToken,
      dataloader: new RethinkDataLoader(),
      // TODO remove exchange & socket when we break GraphQL into a microservice
      exchange,
      socket,
      socketId: socket.id
    };
    // response = {errors, data}
    const result = await graphql(Schema, query, {}, context, variables);
    if (result.errors) {
      console.log('DEBUG GraphQL Error:', result.errors);
    }
    cb(null, result);
  };
}
