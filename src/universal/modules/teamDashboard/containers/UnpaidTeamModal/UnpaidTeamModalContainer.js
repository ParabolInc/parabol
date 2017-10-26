import PropTypes from 'prop-types';
import React from 'react';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import UnpaidTeamModal from 'universal/modules/teamDashboard/components/UnpaidTeamModal/UnpaidTeamModal';
import {withRouter} from 'react-router-dom';
import portal from 'react-portal-hoc';
import ui from 'universal/styles/ui';

const orgDetailsQuery = `
query {
  orgDetails(teamId: $teamId) {
    id
    billingLeaders {
      id
      preferredName
    }
    creditCard {
      brand
    }
    name
  }
}
`;

const mapStateToProps = (state, props) => {
  const {teamId} = props;
  const {orgDetails} = cashay.query(orgDetailsQuery, {
    op: 'unpaidTeamModalContainer',
    key: teamId,
    variables: {
      teamId
    }
  }).data;
  return {
    orgDetails,
    myUserId: state.auth.obj.sub
  };
};

const UnpaidTeamModalContainer = (props) => {
  const {closeAfter, isClosing, history, teamName, orgDetails, myUserId, modalLayout} = props;
  const {billingLeaders, name: orgName, id: orgId} = orgDetails;
  if (billingLeaders.length === 0) return null;

  const billingLeaderName = billingLeaders[0].preferredName;
  const isALeader = billingLeaders.findIndex((leader) => leader.id === myUserId) !== -1;
  const handleClick = () => history.push(`/me/organizations/${orgId}`);
  const problem = `There in an unpaid invoice for ${teamName}.`;
  const solution = isALeader ? `Head over to ${orgName} Settings to add a payment method` :
    `Try reaching out to ${billingLeaderName}`;

  return (
    <UnpaidTeamModal
      closeAfter={closeAfter}
      isClosing={isClosing}
      modalLayout={modalLayout}
      problem={problem}
      solution={solution}
      isALeader={isALeader}
      handleClick={handleClick}
    />
  );
};

UnpaidTeamModalContainer.propTypes = {
  closeAfter: PropTypes.number,
  isClosing: PropTypes.bool,
  modalLayout: PropTypes.oneOf(ui.modalLayout),
  myUserId: PropTypes.string,
  history: PropTypes.object,
  orgDetails: PropTypes.shape({
    creditCard: PropTypes.shape({
      last4: PropTypes.string
    }).isRequired,
    billingLeaders: PropTypes.array.isRequired,
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  orgId: PropTypes.string,
  teamName: PropTypes.string
};

export default portal({closeAfter: 100})(withRouter(connect(mapStateToProps)(UnpaidTeamModalContainer)));
