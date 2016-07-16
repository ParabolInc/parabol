import subscriptions from 'universal/subscriptions/subscriptions';
import socketCluster from 'socketcluster-client';
import {PRESENT, SOUNDOFF} from 'universal/decorators/socketWithPresence/constants';
import {cashay} from 'cashay';

export default function presenceSubscriber(subscriptionString, variables, handlers, getCachedResult) {
  const {channelfy} = subscriptions.find(sub => sub.string === subscriptionString);
  const channelName = channelfy(variables);
  const socket = socketCluster.connect();
  const {add, update, remove, error} = handlers;
  socket.subscribe(channelName, {waitForAuth: true});
  socket.watch(channelName, data => {
    if (data.type === SOUNDOFF) {
      const options = {
        variables: {
          meetingId: variables.meetingId,
          targetId: data.targetId
        }
      };
      cashay.mutate('present', options);
    }
    if (data.type === PRESENT) {
      const {presence} = getCachedResult();
      const alreadyPresent = presence.find(user => user === data.user);
      if (!alreadyPresent) {
        add(data.user);
      }
    }
  });
};
