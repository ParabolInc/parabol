import React, {PropTypes} from 'react';
import {DashModal} from 'universal/components/Dashboard';
import IconLink from 'universal/components/IconLink/IconLink';
import Type from 'universal/components/Type/Type';
import {withRouter} from 'react-router';
import {cashay} from 'cashay';

const LeaveTeamModal = (props) => {
  const {onBackdropClick, teamLead, teamMemberId} = props;
  const handleClick = () => {
    const variables = {teamMemberId};
    cashay.mutate('removeTeamMember', {variables});
  };
  return (
    <DashModal onBackdropClick={onBackdropClick}>
      <Type align="center" bold marginBottom="1.5rem" scale="s7" colorPalette="cool">
        Are you sure?
      </Type>
      <Type align="center" bold scale="s4">
        This will remove you from the team. <br />
        All of your projects will be given to {teamLead} <br />

      </Type>
      <IconLink
        colorPalette="warm"
        icon="arrow-circle-right"
        iconPlacement="right"
        label={`Leave the team`}
        margin="1.5rem 0 0"
        onClick={handleClick}
        scale="large"
      />
    </DashModal>
  );
};

LeaveTeamModal.propTypes = {
  router: PropTypes.object,
  teamId: PropTypes.string,
  teamName: PropTypes.string
};

export default withRouter(LeaveTeamModal);
