// @flow
import React from 'react';
import {withRouter} from 'react-router-dom';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import {DEFAULT_MENU_HEIGHT, DEFAULT_MENU_WIDTH} from 'universal/styles/ui';
import {cacheConfig} from 'universal/utils/constants';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import RelayLoadableTransitionGroup from 'universal/components/RelayLoadableTransitionGroup';
import UpgradeModalLoadable from 'universal/components/UpgradeModalLoadable';
import LoadableLoading from 'universal/components/LoadableLoading';

type Props = {|
  atmosphere: Object,
  closePortal: () => void,
  orgId: string
|};

const query = graphql`
  query UpgradeModalRootQuery($orgId: ID!) {
    viewer {
      ...UpgradeModal_viewer
    }
  }
`;

const loading = (props) => <LoadableLoading {...props} height={DEFAULT_MENU_HEIGHT} width={DEFAULT_MENU_WIDTH} />;

const UpgradeModalRoot = (props: Props) => {
  const {atmosphere, closePortal, onSuccess, orgId} = props;
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{orgId}}
      render={(readyState) => (
        <RelayLoadableTransitionGroup
          LoadableComponent={UpgradeModalLoadable}
          loading={loading}
          readyState={readyState}
          extraProps={{closePortal, onSuccess}}
        />
      )}
    />
  );
};

export default withAtmosphere(withRouter(UpgradeModalRoot));
