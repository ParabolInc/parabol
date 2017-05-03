import Bundle from 'universal/components/Bundle/Bundle';
import React from 'react';
import resolveDefault from 'universal/utils/resolveDefault';
import PropTypes from 'prop-types';

const ImpersonateBundle = ({match}) => {
  const promises = {
    component: import('./ImpersonateContainer').then(resolveDefault)
  };
  return <Bundle match={match} promises={promises} />;
};

ImpersonateBundle.propTypes = {
  match: PropTypes.object.isRequired
};

export default ImpersonateBundle;
