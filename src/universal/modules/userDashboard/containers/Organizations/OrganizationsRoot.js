// @flow
import React from 'react';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import Organizations from 'universal/modules/userDashboard/components/Organizations/Organizations';
import {cacheConfig} from 'universal/utils/constants';
import RelayTransitionGroup from 'universal/components/RelayTransitionGroup';
import LoadingView from 'universal/components/LoadingView/LoadingView';

const query = graphql`
  query OrganizationsRootQuery {
    viewer {
      ...Organizations_viewer
    }
  }
`;

type Props = {|
  atmosphere: Object
|};

const OrganizationsRoot = (props: Props) => {
  const {atmosphere} = props;
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{}}
      render={(readyState) => (
        <RelayTransitionGroup
          readyState={readyState}
          error={<ErrorComponent height={'14rem'} />}
          loading={<LoadingView minHeight="50vh" />}
          ready={<Organizations />}
        />
      )}
    />
  );
};

export default withAtmosphere(OrganizationsRoot);
