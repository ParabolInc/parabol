import Bundle from 'universal/components/Bundle/Bundle';
import React from 'react';
import resolveDefault from 'universal/utils/resolveDefault';
import PropTypes from 'prop-types';

const InvitationBundle = ({match}) => {
  const promises = {
    component: import('./InvitationContainer').then(resolveDefault),
    userDashboardSettings: import('universal/modules/userDashboard/ducks/settingsDuck').then(resolveDefault)
  };
  return <Bundle match={match} promises={promises} />;
};

InvitationBundle.propTypes = {
  match: PropTypes.object.isRequired
};

export default InvitationBundle;
