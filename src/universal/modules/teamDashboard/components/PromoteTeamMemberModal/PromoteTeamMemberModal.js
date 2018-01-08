import PropTypes from 'prop-types';
import React from 'react';
import portal from 'react-portal-hoc';
import {createFragmentContainer} from 'react-relay';
import Button from 'universal/components/Button/Button';
import {DashModal} from 'universal/components/Dashboard';
import Type from 'universal/components/Type/Type';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import PromoteToTeamLeadMutation from 'universal/mutations/PromoteToTeamLeadMutation';
import withMutationProps from 'universal/utils/relay/withMutationProps';

const PromoteTeamMemberModal = (props) => {
  const {
    atmosphere,
    closeAfter,
    closePortal,
    isClosing,
    submitMutation,
    submitting,
    onError,
    onCompleted,
    teamMember
  } = props;
  const {preferredName, teamMemberId} = teamMember;
  const handleClick = () => {
    submitMutation();
    PromoteToTeamLeadMutation(atmosphere, teamMemberId, onError, onCompleted);
    closePortal();
  };
  return (
    <DashModal onBackdropClick={closePortal} isClosing={isClosing} closeAfter={closeAfter}>
      <Type align="center" bold marginBottom="1.5rem" scale="s7" colorPalette="cool">
        Are you sure?
      </Type>
      <Type align="center" bold marginBottom="1.5rem" scale="s4">
        You will be removed as the team leader <br />
        and promote {preferredName}. You will no<br />
        longer be able to change team membership.<br />
        <br />
        This cannot be undone!<br />
      </Type>
      <Button
        buttonSize="large"
        buttonStyle="flat"
        colorPalette="warm"
        icon="arrow-circle-right"
        iconPlacement="right"
        label={`Yes, promote ${preferredName}`}
        onClick={handleClick}
        waiting={submitting}
      />
    </DashModal>
  );
};

PromoteTeamMemberModal.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  closeAfter: PropTypes.number,
  closePortal: PropTypes.func,
  isClosing: PropTypes.bool,
  onBackdropClick: PropTypes.func,
  teamMember: PropTypes.object.isRequired,
  error: PropTypes.any,
  submitting: PropTypes.bool,
  submitMutation: PropTypes.func.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired
};

export default createFragmentContainer(
  portal({escToClose: true, closeAfter: 100})(withMutationProps(withAtmosphere(PromoteTeamMemberModal))),
  graphql`
    fragment PromoteTeamMemberModal_teamMember on TeamMember {
      teamMemberId: id
      preferredName
    }
  `
);
