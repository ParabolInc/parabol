import {ConnectionHandler, ViewerHandler} from 'relay-runtime';
import ContentFilterHandler from 'universal/utils/relay/ContentFilterHandler';

const handlerProvider = (handle) => {
  switch (handle) {
    case 'connection':
      return ConnectionHandler;
    case 'viewer':
      return ViewerHandler;
    case 'contentFilter':
      return ContentFilterHandler;
    // case 'merge':
    //   return MergeHandler;
    default:
      throw new Error(`Unknown handle ${handle}`);
  }
};

export default handlerProvider;
