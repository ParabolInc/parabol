import PropTypes from 'prop-types';
import React from 'react';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {cacheConfig} from 'universal/utils/constants';
import {DEFAULT_MENU_HEIGHT, DEFAULT_MENU_WIDTH, HUMAN_ADDICTION_THRESH, MAX_WAIT_TIME} from 'universal/styles/ui';
import Loadable from 'react-loadable';
import LoadableLoading from 'universal/components/LoadableLoading';
import RelayLoadableTransitionGroup from 'universal/components/RelayLoadableTransitionGroup';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';

const query = graphql`
  query OutcomeCardAssignMenuRootQuery($teamId: ID!) {
    viewer {
      ...OutcomeCardAssignMenu_viewer
    }
  }
`;

const loading = (props) => <LoadableLoading {...props} height={DEFAULT_MENU_HEIGHT} width={DEFAULT_MENU_WIDTH} />;

const LoadableOutcomeCardAssignMenu = Loadable({
  loader: () => System.import(
    /* webpackChunkName: 'OutcomeCardAssignMenu' */
    'universal/modules/outcomeCard/components/OutcomeCardAssignMenu/OutcomeCardAssignMenu'
  ),
  loading,
  delay: HUMAN_ADDICTION_THRESH,
  timeout: MAX_WAIT_TIME
});

const OutcomeCardAssignMenuRoot = (props) => {
  const {area, atmosphere, closePortal, task, teamId} = props;
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      render={(readyState) => (
        <RelayLoadableTransitionGroup
          LoadableComponent={LoadableOutcomeCardAssignMenu}
          loading={loading}
          readyState={readyState}
          extraProps={{area, closePortal, task}}
        />
      )}
    />
  );
};

OutcomeCardAssignMenuRoot.propTypes = {
  area: PropTypes.string.isRequired,
  atmosphere: PropTypes.object.isRequired,
  closePortal: PropTypes.func.isRequired,
  task: PropTypes.object.isRequired,
  teamId: PropTypes.string.isRequired
};

export default withAtmosphere(OutcomeCardAssignMenuRoot);
