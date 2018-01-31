import PropTypes from 'prop-types';
import React from 'react';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import {QueryRenderer} from 'react-relay';
import RelayTransitionGroup from 'universal/components/RelayTransitionGroup';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import Welcome from 'universal/modules/welcome/containers/Welcome/Welcome';

const query = graphql`
  query WelcomeRootQuery {
    viewer {
      ...WelcomeContainer_viewer
    }
  }
`;

const WelcomeRoot = (props) => {
  const {atmosphere} = props;
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{}}
      render={(readyState) => (
        <RelayTransitionGroup
          readyState={readyState}
          error={<ErrorComponent height={'14rem'} />}
          loading={<LoadingView minHeight="50vh" />}
          ready={<Welcome />}
        />
      )}
    />
  );
};

WelcomeRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired
};

export default withAtmosphere(WelcomeRoot);
