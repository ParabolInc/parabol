import PropTypes from 'prop-types';
import React from 'react';
import {graphql} from 'react-relay';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {cacheConfig} from 'universal/utils/constants';
import {DEFAULT_MENU_HEIGHT, DEFAULT_MENU_WIDTH, HUMAN_ADDICTION_THRESH, MAX_WAIT_TIME} from 'universal/styles/ui';
import Loadable from 'react-loadable';
import LoadableLoading from 'universal/components/LoadableLoading';
import RelayLoadableTransitionGroup from 'universal/components/RelayLoadableTransitionGroup';

const query = graphql`
  query OutcomeCardAssignTeamMenuRootQuery {
    viewer {
      ...OutcomeCardAssignTeamMenu_viewer
    }
  }
`;

const loading = (props) => <LoadableLoading {...props} height={DEFAULT_MENU_HEIGHT} width={DEFAULT_MENU_WIDTH} />;

const LoadableOutcomeCardAssignTeamMenu = Loadable({
  loader: () => System.import(
    /* webpackChunkName: 'OutcomeCardAssignTeamMenu' */
    'universal/modules/outcomeCard/components/OutcomeCardAssignMenu/OutcomeCardAssignTeamMenu'
  ),
  loading,
  delay: HUMAN_ADDICTION_THRESH,
  timeout: MAX_WAIT_TIME
});

const OutcomeCardAssignTeamMenuRoot = (props) => {
  const {area, atmosphere, closePortal, task} = props;
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      render={(readyState) => (
        <RelayLoadableTransitionGroup
          LoadableComponent={LoadableOutcomeCardAssignTeamMenu}
          loading={loading}
          readyState={readyState}
          extraProps={{area, closePortal, task}}
        />
      )}
    />
  );
};

OutcomeCardAssignTeamMenuRoot.propTypes = {
  area: PropTypes.string.isRequired,
  atmosphere: PropTypes.object.isRequired,
  closePortal: PropTypes.func.isRequired,
  task: PropTypes.object.isRequired
};

export default withAtmosphere(OutcomeCardAssignTeamMenuRoot);
