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
import withRouter from 'react-router-dom/es/withRouter';
import {MONTHLY_PRICE, PRO} from 'universal/utils/constants';

const RequestNewUser = (props) => {
  const {
    atmosphere,
    styles,
    notification,
    submitting,
    submitMutation,
    onError,
    onCompleted,
    history
  } = props;
  const {id, inviterName, inviteeEmail, orgId, teamName, teamId, team} = notification;
  const {tier} = team;
  const {id: dbNotificationId} = fromGlobalId(id);
  const acceptInvite = () => {
    submitMutation();
    ApproveToOrgMutation(atmosphere, inviteeEmail, orgId, onError, onCompleted);
  };

  const rejectToggle = (
    <Button
      aria-label="Decline new user"
      buttonSize="small"
      colorPalette="gray"
      isBlock
      label="Decline"
      title="Decline new user"
      type="submit"
    />
  );

  const goToTeam = () => history.push(`/team/${teamId}`);

  return (
    <Row compact>
      <div className={css(styles.icon)}>
        <IconAvatar icon="user-circle-o" size="small" />
      </div>
      <div className={css(styles.message)}>
        <b>{inviterName}</b>{' requested to add '}
        <b>{inviteeEmail}</b>{' to '}
        <span className={css(styles.messageVar, styles.notifLink)} onClick={goToTeam}>{teamName}</span>{'.'}<br />
        {tier === PRO && <span>{`Your monthly invoice will increase by $${MONTHLY_PRICE}.`}</span>}
      </div>
      <div className={css(styles.buttonGroup)}>
        <div className={css(styles.button)}>
          <Button
            aria-label="Accept new user"
            colorPalette="cool"
            isBlock
            label="Accept"
            buttonSize={ui.notificationButtonSize}
            title="Accept new user"
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
  history: PropTypes.object.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  styles: PropTypes.object,
  submitMutation: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    inviterName: PropTypes.string.isRequired,
    inviteeEmail: PropTypes.string.isRequired,
    team: PropTypes.object.isRequired,
    teamName: PropTypes.string.isRequired,
    teamId: PropTypes.string.isRequired
  })
};

const styleThunk = () => ({
  ...defaultStyles
});

export default withRouter(withStyles(styleThunk)(RequestNewUser));
