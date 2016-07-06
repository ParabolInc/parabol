import socketCluster from 'socketcluster-client';
import channelLookupMap from './channelLookupMap';
import AuthEngine from 'universal/redux/AuthEngine';

export default function subscriber(subscriptionString, handlers, variables) {
  let baseChannel;
  for (const [key, value] of channelLookupMap.entries()) {
    if (value === subscriptionString) {
      baseChannel = key;
      break;
    }
  }
  const channelName = `${baseChannel}/${variables.meetingId}`;
  const socket = socketCluster.connect({}, {AuthEngine});
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
