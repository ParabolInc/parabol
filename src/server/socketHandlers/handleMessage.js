import {
  GQL_CONNECTION_INIT,
  GQL_CONNECTION_TERMINATE,
  GQL_DATA,
  GQL_ERROR,
  GQL_START,
  GQL_STOP
} from 'universal/utils/constants';
import handleConnect from 'server/socketHandlers/handleConnect';
import handleDisconnect from 'server/socketHandlers/handleDisconnect';
import sendMessage from 'server/socketHelpers/sendMessage';
import wsGraphQLHandler from 'server/socketHandlers/wsGraphQLHandler';
import wsRelaySubscribeHandler from 'server/socketHandlers/wsRelaySubscribeHandler';
import closeUnauthedSocket from 'server/socketHelpers/closeUnauthedSocket';
import relayUnsubscribe from 'server/utils/relayUnsubscribe';

const isSubscriptionPayload = (payload) => payload.query.startsWith('subscription');
const isQueryProvided = (payload) => payload && payload.query;

const handleMessage = (connectionContext) => async (message) => {
  const {socket, subs} = connectionContext;
  // catch raw, non-graphql protocol messages here
  let parsedMessage;
  try {
    parsedMessage = JSON.parse(message);
  } catch (e) {
    /*
     * Invalid frame payload data
     * The endpoint is terminating the connection because a message was received that contained inconsistent data
     * (e.g., non-UTF-8 data within a text message).
     */
    socket.close(1007);
    return;
  }

  const {id: opId, type, payload} = parsedMessage;

  if (type === GQL_CONNECTION_INIT) {
    handleConnect(connectionContext, payload);
  } else if (closeUnauthedSocket(connectionContext)) {
    return;
  }

  if (type === GQL_CONNECTION_TERMINATE) {
    socket.terminate();
    handleDisconnect(connectionContext)();
  } else if (type === GQL_START && isQueryProvided(payload) && isSubscriptionPayload(payload)) {
    wsRelaySubscribeHandler(connectionContext, parsedMessage);
  } else if (type === GQL_START && payload && isQueryProvided(payload)) {
    const result = await wsGraphQLHandler(connectionContext, parsedMessage);
    const resultType = result.errors ? GQL_ERROR : GQL_DATA;
    sendMessage(socket, resultType, result, opId);
  } else if (type === GQL_STOP) {
    relayUnsubscribe(subs, opId);
  }
};

export default handleMessage;
