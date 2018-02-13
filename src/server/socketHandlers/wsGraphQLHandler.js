import {graphql} from 'graphql';
import Schema from 'server/graphql/rootSchema';
import RethinkDataLoader from 'server/utils/RethinkDataLoader';

export default async function wsGraphQLHandler(connectionContext, parsedMessage) {
  const {payload} = parsedMessage;
  const {query, variables} = payload;
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
  return result;
}
