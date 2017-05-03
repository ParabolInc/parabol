import Bundle from 'universal/components/Bundle/Bundle';
import React from 'react';
import resolveDefault from 'universal/utils/resolveDefault';
import PropTypes from 'prop-types';

const MeetingBundle = ({match}) => {
  const promises = {
    component: import('./MeetingContainer').then(resolveDefault)
  };
  return <Bundle match={match} promises={promises} />;
};

MeetingBundle.propTypes = {
  match: PropTypes.object.isRequired
};

export default MeetingBundle;
