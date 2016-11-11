import React, {PropTypes} from 'react';
import {DashModal} from 'universal/components/Dashboard';
import IconLink from 'universal/components/IconLink/IconLink';
import Type from 'universal/components/Type/Type';
import {withRouter} from 'react-router';
import {cashay} from 'cashay';

const RemoveTeamMemberModal = (props) => {
  const {onBackdropClick, preferredName, teamMemberId} = props;
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
        This will remove {preferredName} from <br />
        the team. <br />
      </Type>
      <IconLink
        colorPalette="warm"
        icon="arrow-circle-right"
        iconPlacement="right"
        label={`Remove ${preferredName}`}
        margin="1.5rem 0 0"
        onClick={handleClick}
        scale="large"
      />
    </DashModal>
  );
};

RemoveTeamMemberModal.propTypes = {
  router: PropTypes.object,
  teamId: PropTypes.string,
  teamName: PropTypes.string
};

export default withRouter(RemoveTeamMemberModal);
