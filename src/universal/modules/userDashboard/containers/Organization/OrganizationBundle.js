import Bundle from '../../../../components/Bundle/Bundle';
import React from 'react';
import resolveDefault from '../../../../utils/resolveDefault';
import PropTypes from 'prop-types';

const OrganizationBundle = (props) => {
  const {match} = props;
  const promises = {
    component: import('universal/modules/userDashboard/containers/Organization/OrganizationContainer').then(resolveDefault)
  };
  return (
    <Bundle match={match} promises={promises} />
  );
};

OrganizationBundle.propTypes = {
  match: PropTypes.object.isRequired
};

export default OrganizationBundle;
