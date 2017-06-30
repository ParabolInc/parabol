import PropTypes from 'prop-types';
import React from 'react';
import ProviderList from 'universal/modules/teamDashboard/components/ProviderList/ProviderList';

const TeamIntegrations = (props) => {
  return (
    <div>
      <ProviderList/>
      <div>
        Notifications
      </div>
    </div>
  );
};

TeamIntegrations.propTypes = {

};

export default TeamIntegrations;
