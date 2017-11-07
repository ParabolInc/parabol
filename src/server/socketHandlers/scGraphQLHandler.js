import {graphql} from 'graphql';
import Schema from 'server/graphql/rootSchema';
import RethinkDataLoader from 'server/utils/RethinkDataLoader';
import shortid from 'shortid';

export default function wsGraphQLHandler(exchange, socket, sharedDataloader) {
  return async function graphQLHandler(body, cb) {
    const {query, variables} = body;
    const authToken = socket.getAuthToken();
    const operationId = shortid.generate();
    sharedDataloader.add(operationId, new RethinkDataLoader(authToken));
    const context = {
      authToken,
      // TODO remove exchange & socket when we break GraphQL into a microservice
      exchange,
      socket,
      socketId: socket.id,
      operationId,
      sharedDataloader
    };
    // response = {errors, data}
    const result = await graphql(Schema, query, {}, context, variables);
    sharedDataloader.dispose(operationId);

    if (result.errors) {
      console.log('DEBUG GraphQL Error:', result.errors);
    }
    cb(null, result);
  };
}
