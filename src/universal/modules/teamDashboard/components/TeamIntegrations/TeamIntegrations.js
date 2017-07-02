import PropTypes from 'prop-types';
import React from 'react';
import ProviderList from 'universal/modules/teamDashboard/components/ProviderList/ProviderList';

const TeamIntegrations = (props) => {
  const {providerMap} = props;
  return (
    <div>
      <ProviderList providerMap={providerMap}/>
      <div>
        Notifications
      </div>
    </div>
  );
};

TeamIntegrations.propTypes = {

};

export default TeamIntegrations;
