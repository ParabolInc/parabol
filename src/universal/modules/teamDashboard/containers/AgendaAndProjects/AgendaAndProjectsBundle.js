import Bundle from 'universal/components/Bundle/Bundle';
import React from 'react';
import resolveDefault from 'universal/utils/resolveDefault';
import PropTypes from 'prop-types';

const AgendaAndProjectsBundle = (props) => {
  const {extraProps, match} = props;
  const promises = {
    component: import('./AgendaAndProjectsContainer').then(resolveDefault)
  };
  return (
    <Bundle match={match} promises={promises} extraProps={extraProps} />
  );
};

AgendaAndProjectsBundle.propTypes = {
  extraProps: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
};

export default AgendaAndProjectsBundle;
