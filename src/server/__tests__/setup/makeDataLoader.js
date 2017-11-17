import RethinkDataLoader from 'server/utils/RethinkDataLoader';
import SharedDataLoader from 'server/utils/SharedDataLoader';

const makeDataLoader = (authToken) => {
  const sharedDataLoader = new SharedDataLoader({ttl: 1000});
  const getDataLoader = sharedDataLoader.add(new RethinkDataLoader(authToken, {cache: false}));
  const operationId = Object.keys(sharedDataLoader.warehouse)[0];
  const store = sharedDataLoader.warehouse[operationId];
  // add a method to test if the dataloader got shared
  store.dataloader.__isShared = () => {
    return store.shared;
  };
  return getDataLoader;
};

export default makeDataLoader;
