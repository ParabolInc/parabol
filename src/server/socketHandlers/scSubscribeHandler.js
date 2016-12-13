import {graphql} from 'graphql';
import Schema from 'server/graphql/rootSchema';
import subscriptions from 'universal/subscriptions/subscriptions';
import parseChannel from 'universal/utils/parseChannel';
import {
  ACTIONS,
  ACTIONS_BY_TEAMMEMBER,
  ACTIONS_BY_AGENDA,
  AGENDA,
  ARCHIVED_PROJECTS,
  INVITATIONS,
  NOTIFICATIONS,
  ORGANIZATIONS,
  PROJECTS,
  PRESENCE,
  TEAM,
  TEAM_MEMBERS,
  USER
} from 'universal/subscriptions/constants';

/*
 * This is where you add subscription logic
 * It's a lookup table that turns a channelName into a graphQL query
 * By creating this on the server it keeps payloads really small
 * */
const dechannelfy = {
  [ACTIONS]: (variableString) => ({userId: variableString}),
  [ACTIONS_BY_TEAMMEMBER]: (variableString) => ({teamMemberId: variableString}),
  [ACTIONS_BY_AGENDA]: (variableString) => ({agendaId: variableString}),
  [AGENDA]: (variableString) => ({teamId: variableString}),
  [ARCHIVED_PROJECTS]: (variableString) => ({teamId: variableString}),
  [INVITATIONS]: (variableString) => ({teamId: variableString}),
  [NOTIFICATIONS]: (variableString) => ({userId: variableString}),
  [ORGANIZATIONS]: (variableString) => ({}),
  [PRESENCE]: (variableString) => ({teamId: variableString}),
  [PROJECTS]: (variableString) => ({teamMemberId: variableString}),
  [TEAM]: (variableString) => ({teamId: variableString}),
  [TEAM_MEMBERS]: (variableString) => ({teamId: variableString}),
  [USER]: () => ({})
};

export default function scSubscribeHandler(exchange, socket) {
  return async function subscribeHandler(subbedChannelName = '') {
    const {channel, variableString} = parseChannel(subbedChannelName);
    const subscription = subscriptions.find(sub => sub.channel === channel);
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
        console.log('DEBUG GraphQL Subscribe Error:', result.errors);
      }
    } else {
      console.log(`GraphQL subscription for ${channel} not found`);
      // not a graphql subscription
    }
  };
}
