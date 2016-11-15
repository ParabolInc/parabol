import parseChannel from 'universal/utils/parseChannel';
import {LEAVE, PRESENCE} from 'universal/subscriptions/constants';

export default function scUnsubscribeHandler(exchange, socket) {
  return async function unsubscribeHandler(subbedChannelName) {
    const {channel} = parseChannel(subbedChannelName);
    if (channel === PRESENCE) {
      exchange.publish(subbedChannelName, {type: LEAVE, socketId: socket.id});
    }
  };
}
