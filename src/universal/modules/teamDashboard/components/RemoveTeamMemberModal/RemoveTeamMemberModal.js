import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import {DashModal} from 'universal/components/Dashboard';
import Button from 'universal/components/Button/Button';
import Type from 'universal/components/Type/Type';
import portal from 'react-portal-hoc';
import RemoveTeamMemberMutation from 'universal/mutations/RemoveTeamMemberMutation';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';

const RemoveTeamMemberModal = (props) => {
  const {atmosphere, closeAfter, closePortal, isClosing, teamMember} = props;
  const {teamMemberId, preferredName} = teamMember;
  const handleClick = () => {
    closePortal();
    RemoveTeamMemberMutation(atmosphere, teamMemberId);
  };
  return (
    <DashModal onBackdropClick={closePortal} isClosing={isClosing} closeAfter={closeAfter}>
      <Type align="center" bold marginBottom="1.5rem" scale="s7" colorPalette="cool">
        Are you sure?
      </Type>
      <Type align="center" bold marginBottom="1.5rem" scale="s4">
        This will remove {preferredName} from <br />
        the team. <br />
      </Type>
      <Button
        buttonSize="large"
        buttonStyle="flat"
        colorPalette="warm"
        icon="arrow-circle-right"
        iconPlacement="right"
        label={`Remove ${preferredName}`}
        onClick={handleClick}
      />
    </DashModal>
  );
};

RemoveTeamMemberModal.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  closeAfter: PropTypes.number,
  closePortal: PropTypes.func,
  isClosing: PropTypes.bool,
  teamMember: PropTypes.object.isRequired,
  toggle: PropTypes.any
};

export default createFragmentContainer(
  portal({escToClose: true, closeAfter: 100})(withAtmosphere(RemoveTeamMemberModal)),
  graphql`
    fragment RemoveTeamMemberModal_teamMember on TeamMember {
      teamMemberId: id
      preferredName
    }
  `
);
