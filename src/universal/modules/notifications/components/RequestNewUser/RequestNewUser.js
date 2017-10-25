import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import Button from 'universal/components/Button/Button';
import IconAvatar from 'universal/components/IconAvatar/IconAvatar';
import Row from 'universal/components/Row/Row';
import defaultStyles from 'universal/modules/notifications/helpers/styles';
import ApproveToOrgMutation from 'universal/mutations/ApproveToOrgMutation';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import fromGlobalId from 'universal/utils/relay/fromGlobalId';
import RejectOrgApprovalModal from '../RejectOrgApprovalModal/RejectOrgApprovalModal';

const RequestNewUser = (props) => {
  const {
    atmosphere,
    styles,
    notification,
    submitting,
    submitMutation,
    onError,
    onCompleted
  } = props;
  const {id, inviterName, inviteeEmail, orgId, teamName} = notification;
  const {id: dbNotificationId} = fromGlobalId(id);
  const acceptInvite = () => {
    submitMutation();
    ApproveToOrgMutation(atmosphere, inviteeEmail, orgId, onError, onCompleted);
  };

  const rejectToggle = (
    <Button
      colorPalette="gray"
      isBlock
      label="Decline"
      buttonSize="small"
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
            buttonSize={ui.notificationButtonSize}
            type="submit"
            onClick={acceptInvite}
            waiting={submitting}
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

export default withStyles(styleThunk)(RequestNewUser);
