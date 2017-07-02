import PropTypes from 'prop-types';
import React from 'react';
import ProviderRow from 'universal/modules/teamDashboard/components/ProviderRow/ProviderRow';
import {createFragmentContainer} from 'react-relay';

const providerRow = {
  github: {
    accessToken: 'foo',
    userCount: 2,
    integrationCount: 3,
    providerUserName: 'ackernaut'
  }
};

const ProviderList = (props) => {
  const {providerMap} = props;
  return (
    <div>
      <ProviderRow name="github" providerDetails={providerMap.github}/>
    </div>
  );
};

ProviderList.propTypes = {
  providerMap: PropTypes.object.isRequired
};


export default createFragmentContainer(
  ProviderList,
  graphql`
    fragment ProviderList_providerMap on ProviderMap {
      github {
        ...ProviderRow_providerDetails
      }
      slack {
        ...ProviderRow_providerDetails
      }
    }
  `
);