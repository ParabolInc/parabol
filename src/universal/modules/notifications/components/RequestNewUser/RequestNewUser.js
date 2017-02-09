import React, {Component, PropTypes} from 'react';
import {withRouter} from 'react-router';
import Button from 'universal/components/Button/Button';
import {cashay} from 'cashay';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import defaultStyles from 'universal/modules/notifications/helpers/styles';
import AvatarPlaceholder from 'universal/components/AvatarPlaceholder/AvatarPlaceholder';
import {connect} from 'react-redux';
import RejectOrgApprovalModal from '../RejectOrgApprovalModal/RejectOrgApprovalModal';

const RequestNewUser = (props) => {
  const {notificationId, styles, varList} = props;
  // TODO can we remove inviterUserId from varList?
  const [inviterUserId, inviterName, inviteeEmail, teamId, teamName] = varList;

  const acceptInvite = () => {
    const variables = {
      teamId,
      invitees: [{
        email: inviteeEmail
      }],
    };
    cashay.mutate('inviteTeamMembers', {variables});
  };

  const rejectToggle = <Button
    colorPalette="gray"
    isBlock
    label="Decline"
    size="small"
    type="submit"
  />;

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
          <RejectOrgApprovalModal
            notificationId={notificationId}
            inviteeEmail={inviteeEmail}
            inviterName={inviterName}
            toggle={rejectToggle}
          />
        </div>
      </div>
    </div>
  );
};

const styleThunk = () => ({
  ...defaultStyles
});

export default withStyles(styleThunk)(RequestNewUser);
