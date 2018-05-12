import {graphql} from 'graphql';
import Schema from 'server/graphql/rootSchema';
import RethinkDataLoader from 'server/utils/RethinkDataLoader';
import sendGraphQLErrorResult from 'server/utils/sendGraphQLErrorResult';
import sanitizeGraphQLErrors from 'server/utils/sanitizeGraphQLErrors';

export default async function wsGraphQLHandler (connectionContext, parsedMessage) {
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
    sendGraphQLErrorResult('WebSocket', result.errors[0], query, variables, authToken);
  }
  return sanitizeGraphQLErrors(result);
}
