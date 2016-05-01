import socketCluster from 'socketcluster-client';
import {localStorageVars} from '../../utils/clientOptions';
import {BEGIN, COMMIT, REVERT} from 'redux-optimistic-ui';

/* eslint-disable no-underscore-dangle */
const _SUCCESS = '_SUCCESS';
const _ERROR = '_ERROR';
/* eslint-enable */
let nextTransactionID = 0;
export default () => next => action => {
  if (!action.meta || action.meta.synced !== false) {
    // skip non-document actions or changes received from DB (supersedes optimism)
    return next(action);
  }
  const {type, meta, payload} = action;
  // if we don't want to optimistically update (for actions with high % of failure)
  if (!meta.isOptimistic) {
    return next(action);
  }

  const transactionID = nextTransactionID++;
  next(Object.assign({}, action, {
    meta: {
      optimistic: {
        type: BEGIN,
        id: transactionID
      }
    }
  })); // execute optimistic update
  const socket = socketCluster.connect({authTokenName: localStorageVars.authTokenName});
  return socket.emit('graphql', payload, error => {
    next({
      type: type + (error ? _ERROR : _SUCCESS),
      error,
      payload,
      meta: {
        synced: true,
        optimistic: error ? {type: REVERT, id: transactionID} : {type: COMMIT, id: transactionID}
      }
    });
  });
};
