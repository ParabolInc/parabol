import PropTypes from 'prop-types';
import React from 'react';
import portal from 'react-portal-hoc';
import {connect} from 'react-redux';
import {createFragmentContainer} from 'react-relay';
import {withRouter} from 'react-router-dom';
import Button from 'universal/components/Button/Button';
import {DashModal} from 'universal/components/Dashboard';
import Type from 'universal/components/Type/Type';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import RemoveTeamMemberMutation from 'universal/mutations/RemoveTeamMemberMutation';

const LeaveTeamModal = (props) => {
  const {atmosphere, closeAfter, closePortal, dispatch, isClosing, location, history, team, teamMember} = props;
  const {teamMembers} = team;
  const {teamMemberId} = teamMember;
  const teamLead = teamMembers.find((m) => m.isLead === true);
  const teamLeadName = teamLead ? teamLead.preferredName : 'your leader';
  const handleClick = () => {
    // the KICKED_OUT message will handle this anyways, but it's great to do it here to avoid the ducks of doom
    history.push('/me');
    closePortal();
    RemoveTeamMemberMutation(atmosphere, teamMemberId, {dispatch, location, history});
  };
  return (
    <DashModal onBackdropClick={closePortal} isClosing={isClosing} closeAfter={closeAfter}>
      <Type align="center" bold marginBottom="1.5rem" scale="s7" colorPalette="cool">
        Are you sure?
      </Type>
      <Type align="center" bold marginBottom="1.5rem" scale="s4">
        This will remove you from the team. <br />
        All of your projects will be given to {teamLeadName} <br />
      </Type>
      <Button
        buttonSize="large"
        buttonStyle="flat"
        colorPalette="warm"
        icon="arrow-circle-right"
        iconPlacement="right"
        label={'Leave the team'}
        onClick={handleClick}
      />
    </DashModal>
  );
};

LeaveTeamModal.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  closeAfter: PropTypes.number,
  closePortal: PropTypes.func,
  dispatch: PropTypes.func,
  inputModal: PropTypes.bool,
  isClosing: PropTypes.bool,
  onBackdropClick: PropTypes.func,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired,
  teamMember: PropTypes.object.isRequired
};

export default createFragmentContainer(
  portal({escToClose: true, closeAfter: 100})(
    connect()(withAtmosphere(withRouter(LeaveTeamModal)))
  ),
  graphql`
    fragment LeaveTeamModal_team on Team {
      teamMembers(sortBy: "preferredName") {
        isLead
        preferredName
      }
    }
    fragment LeaveTeamModal_teamMember on TeamMember {
      teamMemberId: id
    }
  `
);
