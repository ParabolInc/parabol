import socketCluster from 'socketcluster-client';

export default function subscriber(channel, key, handlers) {
  const socket = socketCluster.connect();
  const {upsert, update, remove} = handlers;
  const channelName = key ? `${channel}/${key}` : channel;
  socket.subscribe(channelName, {waitForAuth: true});
  socket.on(channelName, data => {
    if (data.type === 'add') {
      upsert(data.fields);
    } else if (data.type === 'remove') {
      remove(data.fields);
    } else {
      update(data.fields, {removeKeys: data.removeKeys});
    }
  });
  socket.on('unsubscribe', unsubChannel => {
    if (unsubChannel === channelName) {
      console.log(`unsubbed from ${unsubChannel}`);
    }
  });
  return () => socket.unsubscribe(channelName);
}

// export default function querySubscriber(channel, key, handlers) {
//   const socket = socketCluster.connect();
//   const {upsert, update, remove} = handlers;
//   const channelName = key ? `${channel}/${key}` : channel;
//   socket.subscribe(channelName, {waitForAuth: true});
//   socket.on(channelName, data => {
//     if (data.type === 'add') {
//       upsert(data.fields);
//     } else if (data.type === 'remove') {
//       remove(data.id);
//     } else {
//       update(data.fields, {removeKeys: data.removeKeys});
//     }
//   });
//   socket.on('unsubscribe', unsubChannel => {
//     if (unsubChannel === channelName) {
//       console.log(`unsubbed from ${unsubChannel}`);
//     }
//   });
//   return () => socket.unsubscribe(channelName);
// }
