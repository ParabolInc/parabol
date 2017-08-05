import {$$asyncIterator} from 'iterall';
import getPubSub from 'server/utils/getPubSub';

const defaultFilterFn = () => true;

const makeSubscribeIter = (channelName, filterFn = defaultFilterFn, resolve) => {
  const asyncIterator = getPubSub().asyncIterator(channelName);
  const getNextPromise = async () => {
    const nextRes = await asyncIterator.next();
    const {value, done} = nextRes;
    if (done) {
      //TODO after implementing a dataloader, clear it here?
      return asyncIterator.return();
    }

    if (filterFn(value)) {
      if (resolve) {
        nextRes.value = await resolve(value);
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
