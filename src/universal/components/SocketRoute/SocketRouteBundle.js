import Bundle from 'universal/components/Bundle/Bundle';
import React from 'react';
import resolveDefault from 'universal/utils/resolveDefault';
import PropTypes from 'prop-types';

const SocketRouteBundle = ({match}) => {
  const promises = {
    component: import('./SocketRoute').then(resolveDefault),
    socket: import('redux-socket-cluster').then((res) => res.socketClusterReducer)
  };
  return <Bundle match={match} promises={promises} />;
};

SocketRouteBundle.propTypes = {
  match: PropTypes.object.isRequired
};

export default SocketRouteBundle;
