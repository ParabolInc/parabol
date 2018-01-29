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
  const {area, assignRef, atmosphere, closePortal, project, teamId} = props;
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
          extraProps={{area, assignRef, closePortal, project}}
        />
      )}
    />
  );
};

OutcomeCardAssignMenuRoot.propTypes = {
  area: PropTypes.string.isRequired,
  assignRef: PropTypes.element,
  atmosphere: PropTypes.object.isRequired,
  closePortal: PropTypes.func.isRequired,
  project: PropTypes.object.isRequired,
  teamId: PropTypes.string.isRequired
};

export default withAtmosphere(OutcomeCardAssignMenuRoot);
