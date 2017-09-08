import PropTypes from 'prop-types';
import React from 'react';
import Button from 'universal/components/Button/Button';
import Row from 'universal/components/Row/Row';
import {cashay} from 'cashay';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import defaultStyles from 'universal/modules/notifications/helpers/styles';
import IconAvatar from 'universal/components/IconAvatar/IconAvatar';
import RejectOrgApprovalModal from '../RejectOrgApprovalModal/RejectOrgApprovalModal';
import InviteTeamMembersMutation from 'universal/mutations/InviteTeamMembersMutation';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import fromGlobalId from 'universal/utils/relay/fromGlobalId';

const RequestNewUser = (props) => {
  const {
    atmosphere,
    dispatch,
    styles,
    notification,
    submitting,
    submitMutation,
    onError,
    onCompleted
  } = props;
  const {id, inviterName, inviteeEmail, teamId, teamName} = notification;
  const {id: dbNotificationId} = fromGlobalId(id);
  const acceptInvite = () => {
    submitMutation();
    const invitees = [{
      email: inviteeEmail
    }];
    InviteTeamMembersMutation(atmosphere, invitees, teamId, dispatch, onError, onCompleted);
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
            disabled={submitting}
            isBlock
            label="Accept"
            size={ui.notificationButtonSize}
            type="submit"
            onClick={acceptInvite}
          />
        </div>
        <div className={css(styles.button)}>
          <RejectOrgApprovalModal
            dbNotificationId={dbNotificationId}
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
  atmosphere: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  styles: PropTypes.object,
  submitMutation: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    inviterName: PropTypes.string.isRequired,
    inviteeEmail: PropTypes.string.isRequired,
    teamName: PropTypes.string.isRequired,
    teamId: PropTypes.string.isRequired
  })
};

const styleThunk = () => ({
  ...defaultStyles
});

export default withAtmosphere(withStyles(styleThunk)(RequestNewUser));
