import {graphql} from 'graphql';
import Schema from 'server/graphql/rootSchema';
import getStaticFeatureFlags from 'server/utils/getStaticFeatureFlags';
import RethinkDataLoader from 'server/utils/RethinkDataLoader';
import getFeatureDecisions from 'universal/utils/getFeatureDecisions';

export default function wsGraphQLHandler(exchange, socket, sharedDataLoader) {
  return async function graphQLHandler(body, cb) {
    const {query, variables} = body;
    const authToken = socket.getAuthToken();
    const dataLoader = sharedDataLoader.add(new RethinkDataLoader(authToken));
    const featureDecisions = getFeatureDecisions(getStaticFeatureFlags());
    const context = {
      authToken,
      // TODO remove exchange & socket when we break GraphQL into a microservice
      exchange,
      featureDecisions,
      socket,
      socketId: socket.id,
      dataLoader
    };
    // response = {errors, data}
    const result = await graphql(Schema, query, {}, context, variables);
    dataLoader.dispose();

    if (result.errors) {
      console.log('DEBUG GraphQL Error:', result.errors);
    }
    if (cb) {
      cb(null, result);
    }
  };
}
