import React, {Component, PropTypes} from 'react';
import {withRouter} from 'react-router';
import Button from 'universal/components/Button/Button';
import {cashay} from 'cashay';

const RequestNewUser = (props) => {
  const {router, varList} = props;
  const [,,inviteeEmail,,teamId] = varList;

  const acceptInvite = () => {
    const variables = {
      teamId,
      invitees: [{
        email: inviteeEmail
      }]
    };
    cashay.mutate('inviteTeamMembers', {variables});
  };

  const declineInvite = () => {

  };

  return (
    <Button
      borderRadius="4px"
      colorPalette="cool"
      isBlock
      label="Accept"
      size="small"
      type="submit"
      onClick={acceptInvite}
    />
  )
};

export default withRouter(RequestNewUser);


