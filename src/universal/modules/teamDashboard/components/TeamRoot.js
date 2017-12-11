import PropTypes from 'prop-types';
import React from 'react';
import {withRouter} from 'react-router-dom';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import TeamContainer from 'universal/modules/teamDashboard/containers/Team/TeamContainer';
import {cacheConfig} from 'universal/utils/constants';

const query = graphql`
  query TeamRootQuery {
    viewer {
      ...TeamContainer_viewer
    }
  }
`;

const TeamRoot = ({atmosphere, location, match}) => {
  const {params: {teamId}} = match;
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      // subscriptions={subscriptions}
      render={({props: renderProps}) => {
        return (
          <TeamContainer viewer={renderProps && renderProps.viewer} location={location} match={match} />
        );
      }}

    />
  );
};

TeamRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
};

export default withRouter(withAtmosphere(TeamRoot));
