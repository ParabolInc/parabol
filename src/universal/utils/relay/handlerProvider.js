import {ConnectionHandler, ViewerHandler} from 'relay-runtime';
import ContentTextHandler from 'universal/utils/relay/ContentFilterHandler';

const handlerProvider = (handle) => {
  switch (handle) {
    case 'connection':
      return ConnectionHandler;
    case 'viewer':
      return ViewerHandler;
    case 'contentText':
      return ContentTextHandler;
    default:
      throw new Error(`Unknown handle ${handle}`);
  }
};

export default handlerProvider;
