import socketCluster from 'socketcluster-client';
import {cashay} from 'cashay';
import {EDIT, PRESENT, LEAVE, SOUNDOFF} from './constants';

export default function presenceSubscriber(channel, key, handlers) {
  const fullChannel = `${channel}/${key}`;
  const socket = socketCluster.connect();
  const {upsert, remove} = handlers;
  socket.subscribe(fullChannel, {waitForAuth: true});
  socket.watch(fullChannel, (data) => {
    if (data.type === SOUNDOFF) {
      const {editing} = cashay.store.getState();
      const options = {
        variables: {
          teamId: key,
          targetId: data.targetId,
          editing
        }
      };
      cashay.mutate('present', options);
    }
    if (data.type === PRESENT) {
      upsert({
        id: data.socketId,
        userId: data.userId,
        editing: data.editing
      });
    }
    if (data.type === EDIT) {
      upsert({
        id: data.socketId,
        editing: data.editing
      });
    }
    if (data.type === LEAVE) {
      remove({id: data.socketId});
    }
  });
  return () => socket.unsubscribe(fullChannel);
}
