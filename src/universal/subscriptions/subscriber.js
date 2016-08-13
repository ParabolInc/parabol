import socketCluster from 'socketcluster-client';
import subscriptions from './subscriptions';

export default function subscriber(subscriptionString, variables, handlers) {
  const {channelfy, rehydrate} = subscriptions.find(sub => sub.string === subscriptionString);
  const channelName = channelfy(variables);
  const socket = socketCluster.connect();
  const {upsert, update, remove} = handlers;
  socket.subscribe(channelName, {waitForAuth: true});
  socket.on(channelName, data => {
    if (data.type === 'add') {
      const fields = rehydrate(data.fields);
      upsert(fields);
    } else if (data.type === 'remove') {
      remove(data.id);
    } else {
      const fields = rehydrate(data.fields);
      update(fields, {path: data.path, removeKeys: data.removeKeys});
    }
  });
  socket.on('unsubscribe', unsubChannel => {
    if (unsubChannel === channelName) {
      console.log(`unsubbed from ${unsubChannel}`);
    }
  });
  return () => socket.unsubscribe(channelName);
}
