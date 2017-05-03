import Bundle from 'universal/components/Bundle/Bundle';
import React from 'react';
import resolveDefault from 'universal/utils/resolveDefault';
import PropTypes from 'prop-types';

const TeamSettingsBundle = ({match}) => {
  const promises = {
    component: import('./TeamSettingsContainer').then(resolveDefault)
  };
  return (
    <Bundle match={match} promises={promises} />
  );
};

TeamSettingsBundle.propTypes = {
  match: PropTypes.object.isRequired
};

export default TeamSettingsBundle;
