import {PubSub} from 'graphql-subscriptions';

let pubsub;

// TODO replace with redis
const getPubSub = () => {
  if (!pubsub) {
    pubsub = new PubSub();
  }
  return pubsub;
};

export default getPubSub;

