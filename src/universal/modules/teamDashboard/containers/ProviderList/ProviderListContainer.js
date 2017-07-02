import PropTypes from 'prop-types';
import React from 'react';
import {QueryRenderer, graphql} from 'react-relay';
import relayEnv from 'client/relayEnv';

//const providerListQuery = graphql`
//  query getProviders {
//    viewer {
//      ...ListPage_viewer
//    }
//  }
//`

const ProviderListContainer = (props) => {
  return (
    <div>
      provider list container
    </div>
  );
};

ProviderListContainer.propTypes = {
  providers: PropTypes.array.isRequired
};

export default ProviderListContainer;
