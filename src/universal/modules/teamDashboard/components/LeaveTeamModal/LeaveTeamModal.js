import PropTypes from 'prop-types';
import React from 'react';
import portal from 'react-portal-hoc';
import {withRouter} from 'react-router-dom';
import Button from 'universal/components/Button/Button';
import {DashModal} from 'universal/components/Dashboard';
import Type from 'universal/components/Type/Type';
import RemoveTeamMemberMutation from 'universal/mutations/RemoveTeamMemberMutation';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';

const LeaveTeamModal = (props) => {
  const {atmosphere, closeAfter, closePortal, isClosing, history, teamLead, teamMemberId} = props;
  const handleClick = () => {
    // the KICKED_OUT message will handle this anyways, but it's great to do it here to avoid the ducks of doom
    history.push('/me');
    closePortal();
    RemoveTeamMemberMutation(atmosphere, teamMemberId);
  };
  return (
    <DashModal onBackdropClick={closePortal} isClosing={isClosing} closeAfter={closeAfter}>
      <Type align="center" bold marginBottom="1.5rem" scale="s7" colorPalette="cool">
        Are you sure?
      </Type>
      <Type align="center" bold marginBottom="1.5rem" scale="s4">
        This will remove you from the team. <br />
        All of your projects will be given to {teamLead} <br />
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
  inputModal: PropTypes.bool,
  isClosing: PropTypes.bool,
  onBackdropClick: PropTypes.func,
  history: PropTypes.object.isRequired,
  teamLead: PropTypes.string.isRequired,
  teamMemberId: PropTypes.string.isRequired
};

export default portal({escToClose: true, closeAfter: 100})(
  withAtmosphere(withRouter(
    LeaveTeamModal)
  )
);
