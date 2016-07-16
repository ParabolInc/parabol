import {graphql} from 'graphql';
import Schema from 'server/graphql/rootSchema';
import subscriptions from 'universal/redux/subscriptions';
import parseChannel from './parseChannel';

/*
 * This is where you add subscription logic
 * It's a lookup table that turns a channelName into a graphQL query
 * By creating this on the server it keeps payloads really small
 * */
const dechannelfy = {
  meeting(variableString) {
    return {meetingId: variableString};
  },
  presence(variableString) {
    return {meetingId: variableString};
  }
};

export default function scSubscribeHandler(exchange, socket) {
  return async function subscribeHandler(subbedChannelName = '') {
    const {channel, variableString} = parseChannel(subbedChannelName);
    const subscription = subscriptions.find(sub => sub.channel === channel);
    if (subscription) {
      const variables = dechannelfy[channel](variableString);
      const context = {
        authToken: socket.getAuthToken(),
        exchange,
        socket,
        subbedChannelName
      };
      // swallow return value, it's a subscription
      graphql(Schema, subscription.string, {}, context, variables);
    } else {
      console.log(`GraphQL subscription for ${channel} not found`)
      // not a graphql subscription
    }
  };
}
