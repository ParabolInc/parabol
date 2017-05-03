import Bundle from 'universal/components/Bundle/Bundle';
import React from 'react';
import resolveDefault from 'universal/utils/resolveDefault';
import PropTypes from 'prop-types';

const TeamArchiveBundle = ({match}) => {
  const promises = {
    component: import('./TeamArchiveContainer').then(resolveDefault)
  };
  return <Bundle match={match} promises={promises} />;
};

TeamArchiveBundle.propTypes = {
  match: PropTypes.object.isRequired
};

export default TeamArchiveBundle;
