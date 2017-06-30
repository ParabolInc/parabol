import PropTypes from 'prop-types';
import React from 'react';
import ProviderRow from 'universal/modules/teamDashboard/components/ProviderRow/ProviderRow';

const providerRow = {
  github: {
    accessToken: 'foo',
    userCount: 2,
    integrationCount: 3,
    providerUserName: 'ackernaut'
  }
};

const ProviderList = (props) => {
  return (
    <div>
      <ProviderRow name="github" provider={providerRow.github}/>
    </div>
  );
};

ProviderList.propTypes = {
  providers: PropTypes.array.isRequired
};

export default ProviderList;
