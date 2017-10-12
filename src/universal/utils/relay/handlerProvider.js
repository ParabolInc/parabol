import {
  ConnectionHandler,
  ViewerHandler
} from 'relay-runtime';
import MergeHandler from 'universal/utils/relay/MergeHandler';

const handlerProvider = (handle) => {
  switch (handle) {
    case 'connection':
      return ConnectionHandler;
    case 'viewer':
      return ViewerHandler;
    case 'merge':
      return MergeHandler;
    default:
      throw new Error(`Unknown handle ${handle}`);
  }
};

export default handlerProvider;
