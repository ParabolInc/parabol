import RethinkDataLoader from 'server/utils/RethinkDataLoader';
import SharedDataLoader from 'shared-dataloader';

const makeDataLoader = (authToken) => {
  const sharedDataLoader = new SharedDataLoader({ttl: 1000, onShare: '_share'});
  return sharedDataLoader.add(new RethinkDataLoader(authToken, {cache: false}));
};

export default makeDataLoader;
