import {ConnectionHandler, ViewerHandler} from 'relay-runtime';

const handlerProvider = (handle) => {
  switch (handle) {
    case 'connection':
      return ConnectionHandler;
    case 'viewer':
      return ViewerHandler;
    default:
      throw new Error(`Unknown handle ${handle}`);
  }
};

export default handlerProvider;
