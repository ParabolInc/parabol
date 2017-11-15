import {graphql} from 'graphql';
import Schema from 'server/graphql/rootSchema';
import RethinkDataLoader from 'server/utils/RethinkDataLoader';

export default function wsGraphQLHandler(exchange, socket, sharedDataLoader) {
  return async function graphQLHandler(body, cb) {
    const {query, variables} = body;
    const authToken = socket.getAuthToken();
    const getDataLoader = sharedDataLoader.add(new RethinkDataLoader(authToken));
    const dataLoader = getDataLoader();
    const context = {
      authToken,
      // TODO remove exchange & socket when we break GraphQL into a microservice
      exchange,
      socket,
      socketId: socket.id,
      getDataLoader
    };
    // response = {errors, data}
    const result = await graphql(Schema, query, {}, context, variables);
    dataLoader.dispose();

    if (result.errors) {
      console.log('DEBUG GraphQL Error:', result.errors);
    }
    cb(null, result);
  };
}
