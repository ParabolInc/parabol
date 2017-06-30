import PropTypes from 'prop-types';
import React from 'react';

const TeamIntegrations = (props) => {
  return (
    <div>
      {providers.map((provider) => {
        return <ProviderRow provider={provider} />
      })}
    </div>
  );
};

TeamIntegrations.propTypes = {
  providers: PropTypes.array.isRequired
};

export default TeamIntegrations;
