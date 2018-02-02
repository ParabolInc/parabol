import {graphql} from 'graphql';
import Schema from 'server/graphql/rootSchema';
import RethinkDataLoader from 'server/utils/RethinkDataLoader';
import {GQL_DATA, GQL_ERROR} from 'universal/utils/constants';

export default async function wsGraphQLHandler(connectionContext, parsedMessage) {
  const {id: opId, payload: {query, variables}} = parsedMessage;
  const {id: socketId, authToken, sharedDataLoader} = connectionContext;
  const dataLoader = sharedDataLoader.add(new RethinkDataLoader(authToken));
  const context = {
    authToken,
    socketId,
    dataLoader
  };
  const result = await graphql(Schema, query, {}, context, variables);
  dataLoader.dispose();

  if (result.errors) {
    console.log('DEBUG GraphQL Error:', result.errors);
  }
  return {
    payload: result,
    id: opId,
    type: result.errors ? GQL_ERROR : GQL_DATA
  };
}
