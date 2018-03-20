import PropTypes from 'prop-types';
import React from 'react';
import ProviderList from 'universal/modules/teamDashboard/components/ProviderList/ProviderList';

const TeamIntegrations = (props) => {
  const {jwt, viewer, teamId} = props;
  return <ProviderList viewer={viewer} jwt={jwt} teamId={teamId} />;
};

TeamIntegrations.propTypes = {
  jwt: PropTypes.string,
  viewer: PropTypes.object.isRequired,
  teamId: PropTypes.string.isRequired
};

export default TeamIntegrations;
