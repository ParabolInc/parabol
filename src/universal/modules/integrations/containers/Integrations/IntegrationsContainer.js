import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import portal from 'react-portal-hoc';
import Integrations from 'universal/modules/integrations/components/Integrations/Integrations';

const teamSettingsQuery = `
query {
  integrations(teamMemberId: $teamMemberId) @live {
    id
    service
    userId
  }
}`;

const mapStateToProps = (state, props) => {
  const {teamMemberId} = props;
  const {integrations: services} = cashay.query(teamSettingsQuery, {
    op: 'integrationsContainer',
    key: teamMemberId,
    sort: {
      integrations: (a, b) => a.service > b.service ? 1 : -1,
    },
    variables: {teamMemberId}
  }).data;
  return {
    services
  };
};

const IntegrationsContainer = (props) => {
  const {
    closeAfter,
    closePortal,
    isClosing,
    teamMemberId,
    services,
  } = props;
  return (
    <Integrations
      closeAfter={closeAfter}
      closePortal={closePortal}
      isClosing={isClosing}
      teamMemberId={teamMemberId}
      services={services}
    />
  );
};

IntegrationsContainer.propTypes = {
  dispatch: PropTypes.func.isRequired,
  invitations: PropTypes.array.isRequired,
  myTeamMemberId: PropTypes.string.isRequired,
  orgApprovals: PropTypes.array.isRequired,
  params: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired,
  teamMembers: PropTypes.array.isRequired
};

export default portal({escToClose: true, closeAfter: 100})(
  connect(mapStateToProps)(IntegrationsContainer)
);
