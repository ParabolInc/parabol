import socketCluster from 'socketcluster-client';
import subscriptions from './subscriptions';

export default function subscriber(subscriptionString, variables, handlers, cachedResult) {
  const {channelfy} = subscriptions.find(sub => sub.string === subscriptionString);
  const channelName = channelfy(variables);
  const socket = socketCluster.connect();
  const {add, update, remove, error} = handlers;
  socket.subscribe(channelName, {waitForAuth: true});
  socket.on(channelName, data => {
    if (data.type === 'add') {
      add(data.fields);
    } else if (data.type === 'remove') {
      remove(data.id);
    } else {
      update(data.fields, data.removeKeys);
    }
  });
  socket.on('unsubscribe', unsubChannel => {
    if (unsubChannel === channelName) {
      console.log(`unsubbed from ${unsubChannel}`);
    }
  });
  return () => socket.unsubscribe(channelName);
};
