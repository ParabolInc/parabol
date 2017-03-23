import React, {PropTypes} from 'react';
import Button from 'universal/components/Button/Button';
import Row from 'universal/components/Row/Row';
import {cashay} from 'cashay';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import defaultStyles from 'universal/modules/notifications/helpers/styles';
import IconAvatar from 'universal/components/IconAvatar/IconAvatar';
import RejectOrgApprovalModal from '../RejectOrgApprovalModal/RejectOrgApprovalModal';

const RequestNewUser = (props) => {
  const {notificationId, styles, varList} = props;
  const [, inviterName, inviteeEmail, teamId, teamName] = varList;

  const acceptInvite = () => {
    const variables = {
      teamId,
      invitees: [{
        email: inviteeEmail
      }],
    };
    cashay.mutate('inviteTeamMembers', {variables});
  };

  const rejectToggle = (
    <Button
      colorPalette="gray"
      isBlock
      label="Decline"
      size="smallest"
      type="submit"
    />
  );

  return (
    <Row>
      <div className={css(styles.icon)}>
        <IconAvatar icon="user" size="medium" />
      </div>
      <div className={css(styles.message)}>
        <span className={css(styles.messageVar)}>{inviterName} </span>
        requested to add
        <span className={css(styles.messageVar)}> {inviteeEmail} </span>
        to
        <span className={css(styles.messageVar)}> {teamName}</span>
        <div className={css(styles.messageSub)}>Your monthly invoice will increase by $5.</div>
      </div>
      <div className={css(styles.buttonGroup)}>
        <div className={css(styles.button)}>
          <Button
            colorPalette="cool"
            isBlock
            label="Accept"
            size={ui.notificationButtonSize}
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
    </Row>
  );
};

RequestNewUser.propTypes = {
  notificationId: PropTypes.string.isRequired,
  styles: PropTypes.object,
  varList: PropTypes.array.isRequired
};

const styleThunk = () => ({
  ...defaultStyles
});

export default withStyles(styleThunk)(RequestNewUser);
