import RethinkDataLoader from '../../utils/RethinkDataLoader'
import DataLoaderWarehouse from 'dataloader-warehouse'

const makeDataLoader = (authToken) => {
  const sharedDataLoader = new DataLoaderWarehouse({ttl: 1000, onShare: '_share'})
  return sharedDataLoader.add(new RethinkDataLoader(authToken, {cache: false}))
}

export default makeDataLoader
