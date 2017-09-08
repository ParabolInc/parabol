import {$$asyncIterator} from 'iterall';
import getPubSub from 'server/utils/getPubSub';
import {NOTIFICATION_ADDED} from 'universal/utils/constants';

const defaultFilterFn = () => true;

const makeSubscribeIter = (channelName, options = {}) => {
  const {filterFn = defaultFilterFn, resolve} = options;
  const asyncIterator = getPubSub().asyncIterator(channelName);
  const getNextPromise = async () => {
    const nextRes = await asyncIterator.next();
    const {value, done} = nextRes;
    if (done) {
      return asyncIterator.return();
    }

    if (filterFn(value)) {
      if (resolve) {
        return {
          done: false,
          value: await resolve(value)
        };
      }
      if (channelName.startsWith(NOTIFICATION_ADDED)) {
      console.log('nextRes', nextRes)
      }
      return nextRes;
    }
    // if the value doesn't get filtered, send it to the client. else, restart the listener
    return getNextPromise();
  };

  return {
    next() {
      return getNextPromise();
    },
    return() {
      return asyncIterator.return();
    },
    throw(error) {
      return asyncIterator.throw(error);
    },
    [$$asyncIterator]() {
      return this;
    }
  };
};

export default makeSubscribeIter;
