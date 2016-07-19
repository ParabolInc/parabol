import subscriptions from 'universal/subscriptions/subscriptions';
import socketCluster from 'socketcluster-client';
import {PRESENT, SOUNDOFF, LEAVE} from 'universal/subscriptions/constants';
import {cashay} from 'cashay';

export default function presenceSubscriber(subscriptionString, variables, handlers) {
  const {channelfy} = subscriptions.find(sub => sub.string === subscriptionString);
  const channelName = channelfy(variables);
  const socket = socketCluster.connect();
  const {add, remove} = handlers;
  socket.subscribe(channelName, {waitForAuth: true});
  socket.watch(channelName, data => {
    if (data.type === SOUNDOFF) {
      const options = {
        variables: {
          teamId: variables.teamId,
          targetId: data.targetId
        }
      };
      cashay.mutate('present', options);
    }
    if (data.type === PRESENT) {
      add({
        id: data.socketId,
        userId: data.userId
      });
    }
    if (data.type === LEAVE) {
      remove(data.socketId);
    }
  });
}
