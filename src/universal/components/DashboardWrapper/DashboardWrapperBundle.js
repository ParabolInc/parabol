import Bundle from 'universal/components/Bundle/Bundle';
import React from 'react';
import resolveDefault from 'universal/utils/resolveDefault';
import PropTypes from 'prop-types';

const DashboardWrapperBundle = ({match}) => {
  const promises = {
    component: import('./DashboardWrapper').then(resolveDefault)
  };
  return <Bundle match={match} promises={promises} />;
};

DashboardWrapperBundle.propTypes = {
  match: PropTypes.object.isRequired
};

export default DashboardWrapperBundle;
