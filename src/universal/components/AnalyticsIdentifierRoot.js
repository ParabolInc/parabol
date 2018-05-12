// @flow
import React from 'react';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import AnalyticsIdentifier from 'universal/components/AnalyticsIdentifier';
import {withRouter} from 'react-router-dom';

const query = graphql`
  query AnalyticsIdentifierRootQuery {
    viewer {
      ...AnalyticsIdentifier_viewer
    }
  }
`;

type Props = {|
  atmosphere: Object,
  location: Location
|};

const AnalyticsIdentifierRoot = (props: Props) => {
  const {atmosphere, location} = props;
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{}}
      render={({props: renderProps}) => {
        return (
          <AnalyticsIdentifier
            location={location}
            viewer={renderProps ? renderProps.viewer : null}
          />
        );
      }}
    />
  );
};

export default withRouter(withAtmosphere(AnalyticsIdentifierRoot));
