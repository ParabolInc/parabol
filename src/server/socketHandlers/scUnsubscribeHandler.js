import parseChannel from './parseChannel';
import {LEAVE, PRESENCE} from 'universal/subscriptions/constants';
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

export default function scUnsubscribeHandler(exchange, socket) {
  return async function unsubscribeHandler(subbedChannelName) {
    const {channel} = parseChannel(subbedChannelName);
    if (channel === PRESENCE) {
      exchange.publish(subbedChannelName, {type: LEAVE, socketId: socket.id});
    }
    console.log('unsubbing from', subbedChannelName);
  };
}
