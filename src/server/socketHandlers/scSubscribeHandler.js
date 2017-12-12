import {graphql} from 'graphql';
import Schema from 'server/graphql/rootSchema';
import subscriptions from 'universal/subscriptions/subscriptions';
import parseChannel from 'universal/utils/parseChannel';
import {
  INVITATIONS,
  ORG_APPROVALS,
  PRESENCE,
  TEAM,
  TEAM_MEMBERS,
  USERS_BY_ORG
} from 'universal/subscriptions/constants';

/*
 * This is where you add subscription logic
 * It's a lookup table that turns a channelName into a graphQL query
 * By creating this on the server it keeps payloads really small
 * */
const dechannelfy = {
  [INVITATIONS]: (variableString) => ({teamId: variableString}),
  [ORG_APPROVALS]: (teamId) => ({teamId}),
  [TEAM]: (variableString) => ({teamId: variableString}),
  [TEAM_MEMBERS]: (variableString) => ({teamId: variableString}),
  [USERS_BY_ORG]: (orgId) => ({orgId})
};

const temporalSubs = [PRESENCE];
export default function scSubscribeHandler(exchange, socket) {
  return async function subscribeHandler(subbedChannelName = '') {
    const {channel, variableString} = parseChannel(subbedChannelName);
    const subscription = subscriptions.find((sub) => sub.channel === channel);

    if (subscription) {
      const dechannelfier = dechannelfy[channel];
      if (!dechannelfier) {
        console.log(`No dechannelfier found for ${channel}`);
      }
      const variables = dechannelfier(variableString);
      const context = {
        authToken: socket.getAuthToken(),
        exchange,
        socket,
        subbedChannelName
      };
      // swallow return value, it's a subscription
      const result = await graphql(Schema, subscription.string, {}, context, variables);
      if (result.errors) {
        console.log('DEBUG GraphQL Subscribe Error:', channel, result.errors);
      }
    } else if (!temporalSubs.includes(channel)) {
      console.log(`GraphQL subscription for ${channel} not found`);
      // not a graphql subscription
    }
  };
}
