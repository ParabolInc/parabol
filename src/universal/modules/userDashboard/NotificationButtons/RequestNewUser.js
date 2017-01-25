import React, {Component, PropTypes} from 'react';
import {withRouter} from 'react-router';
import Button from 'universal/components/Button/Button';
import {cashay} from 'cashay';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import defaultStyles from './styles';
import AvatarPlaceholder from 'universal/components/AvatarPlaceholder/AvatarPlaceholder';

const RequestNewUser = (props) => {
  const {notificationId, router, styles, varList} = props;
  const [inviterName, inviterId, inviteeEmail, teamName, teamId] = varList;

  const acceptInvite = () => {
    const variables = {
      teamId,
      invitees: [{
        email: inviteeEmail
      }],
      notificationId
    };
    cashay.mutate('inviteTeamMembers', {variables});
  };

  const declineInvite = () => {
    dispatch(declineNewUser());
  };
  return (
    <div className={css(styles.row)}>
      <div className={css(styles.icon)}>
        <AvatarPlaceholder/>
      </div>
      <div className={css(styles.message)}>
        <span className={css(styles.messageVar)}>{inviterName} </span>
        requested to add
        <span className={css(styles.messageVar)}> {inviteeEmail} </span>
        to
        <span className={css(styles.messageVar)}> {teamName}</span>
      </div>
      <div className={css(styles.buttonGroup)}>
        <div className={css(styles.button)}>
          <Button
            colorPalette="cool"
            isBlock
            label="Accept"
            size="small"
            type="submit"
            onClick={acceptInvite}
          />
        </div>
        <div className={css(styles.button)}>
          <Button
            colorPalette="gray"
            isBlock
            label="Decline"
            size="small"
            type="submit"
            onClick={declineInvite}
          />
        </div>
      </div>
    </div>
  );
};

const styleThunk = () => ({
  ...defaultStyles
});

export default withRouter(
  withStyles(styleThunk)(RequestNewUser)
);
