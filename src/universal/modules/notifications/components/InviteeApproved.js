import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import Button from 'universal/components/Button/Button';
import IconAvatar from 'universal/components/IconAvatar/IconAvatar';
import Row from 'universal/components/Row/Row';
import defaultStyles from 'universal/modules/notifications/helpers/styles';
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import fromGlobalId from 'universal/utils/relay/fromGlobalId';
import withRouter from 'react-router-dom/es/withRouter';

const InviteeApproved = (props) => {
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
  const {id, inviteeEmail, teamName, teamId} = notification;
  const {id: dbNotificationId} = fromGlobalId(id);
  const acknowledge = () => {
    submitMutation();
    ClearNotificationMutation(atmosphere, dbNotificationId, onError, onCompleted);
  };
  const goToTeam = () => history.push(`/team/${teamId}`);
  return (
    <Row compact>
      <div className={css(styles.icon)}>
        <IconAvatar icon="user-circle-o" size="small" />
      </div>
      <div className={css(styles.message)}>
        <b>{inviteeEmail}</b>
        {' has been approved to join '}
        <span className={css(styles.messageVar, styles.notifLink)} onClick={goToTeam}>{teamName}</span>{'.'}
        <br />
        {'We have sent them an invitation.'}
      </div>
      <div className={css(styles.iconButton)}>
        <Button
          aria-label="Clear this notification"
          buttonSize="small"
          colorPalette="gray"
          icon="check"
          isBlock
          type="submit"
          onClick={acknowledge}
        />
      </div>
    </Row>
  );
};

InviteeApproved.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  styles: PropTypes.object,
  submitMutation: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    teamName: PropTypes.string.isRequired
  })
};

const styleThunk = () => ({
  ...defaultStyles,

  button: {
    marginLeft: ui.rowCompactGutter,
    minWidth: '3.5rem'
  }
});

export default withRouter(withStyles(styleThunk)(InviteeApproved));
