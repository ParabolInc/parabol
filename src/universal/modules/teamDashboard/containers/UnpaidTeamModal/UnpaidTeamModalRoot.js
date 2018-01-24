import PropTypes from 'prop-types';
import React from 'react';
import portal from 'react-portal-hoc';
import {withRouter} from 'react-router-dom';
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer';
import RelayTransitionGroup from 'universal/components/RelayTransitionGroup';
import UnpaidTeamModal from 'universal/modules/teamDashboard/components/UnpaidTeamModal/UnpaidTeamModal';
import ui from 'universal/styles/ui';
import {cacheConfig} from 'universal/utils/constants';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';

const query = graphql`
  query UnpaidTeamModalRootQuery($teamId: ID!) {
    viewer {
      ...UnpaidTeamModal_viewer
    }
  }
`;

const UnpaidTeamModalRoot = (props) => {
  const {atmosphere, closeAfter, isClosing, modalLayout, teamId} = props;
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      render={(readyState) => (
        <RelayTransitionGroup
          readyState={readyState}
          error={<ErrorComponent height={'14rem'} />}
          loading={<LoadingView minHeight="50vh" />}
          ready={<UnpaidTeamModal
            closeAfter={closeAfter}
            isClosing={isClosing}
            modalLayout={modalLayout}
          />}
        />
      )}
    />
  );
};

UnpaidTeamModalRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  closeAfter: PropTypes.number,
  isClosing: PropTypes.bool,
  modalLayout: PropTypes.oneOf(ui.modalLayout),
  teamId: PropTypes.string.isRequired
};

export default portal({closeAfter: 100})(withAtmosphere(withRouter(UnpaidTeamModalRoot)));
