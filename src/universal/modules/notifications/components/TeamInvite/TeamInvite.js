import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {createFragmentContainer} from 'react-relay';
import Button from 'universal/components/Button/Button';
import IconAvatar from 'universal/components/IconAvatar/IconAvatar';
import Row from 'universal/components/Row/Row';
import defaultStyles from 'universal/modules/notifications/helpers/styles';
import {showInfo} from 'universal/modules/toast/ducks/toastDuck';
import AcceptTeamInviteMutation from 'universal/mutations/AcceptTeamInviteMutation';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';

const TeamInvite = (props) => {
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
  const {notificationId, inviterName, team} = notification;
  const {teamName} = team;
  const handleCompleted = () => {
    dispatch(showInfo({
      autoDismiss: 10,
      title: 'Congratulations!',
      message: `You’ve been added to team ${teamName}`
    }));
    onCompleted();
  };

  const accept = () => {
    submitMutation();
    AcceptTeamInviteMutation(atmosphere, notificationId, onError, handleCompleted);
  };

  return (
    <Row compact>
      <div className={css(styles.icon)}>
        <IconAvatar icon="users" size="small" />
      </div>
      <div className={css(styles.message)}>
        {'You have been invited by '}
        <b>{inviterName}</b>
        {' to join '}
        <b>{teamName}</b>
        {'.'}
      </div>
      <div className={css(styles.button)}>
        <Button
          aria-label="Accept team invitation"
          buttonSize={ui.notificationButtonSize}
          colorPalette="cool"
          isBlock
          label="Accept"
          onClick={accept}
          title="Accept team invitation"
          type="submit"
          waiting={submitting}
        />
      </div>
    </Row>
  );
};

TeamInvite.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  styles: PropTypes.object,
  submitMutation: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  notification: PropTypes.object.isRequired
};

const styleThunk = () => ({
  ...defaultStyles
});

export default createFragmentContainer(
  connect()(withStyles(styleThunk)(TeamInvite)),
  graphql`
    fragment TeamInvite_notification on Notification {
      notificationId: id
      ... on NotifyInvitation {
        inviterName
        team {
          teamName: name
        }
      }
    }`
);
