import {css} from 'react-emotion';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {createFragmentContainer} from 'react-relay';
import Button from 'universal/components/Button/Button';
import IconAvatar from 'universal/components/IconAvatar/IconAvatar';
import Row from 'universal/components/Row/Row';
import defaultStyles from 'universal/modules/notifications/helpers/styles';
import AcceptTeamInviteMutation from 'universal/mutations/AcceptTeamInviteMutation';
import ui from 'universal/styles/ui';
import {withRouter} from 'react-router-dom';

const TeamInvite = (props) => {
  const {
    atmosphere,
    dispatch,
    history,
    notification,
    submitting,
    submitMutation,
    onError,
    onCompleted
  } = props;
  const {notificationId, inviter: {inviterName}, team} = notification;
  const {teamName} = team;
  const accept = () => {
    submitMutation();
    AcceptTeamInviteMutation(atmosphere, {notificationId}, {dispatch, history}, onError, onCompleted);
  };

  return (
    <Row compact>
      <div className={css(defaultStyles.icon)}>
        <IconAvatar icon="users" size="small" />
      </div>
      <div className={css(defaultStyles.message)}>
        {'You have been invited by '}
        <b>{inviterName}</b>
        {' to join '}
        <b>{teamName}</b>
        {'.'}
      </div>
      <div className={css(defaultStyles.button)}>
        <Button
          aria-label="Accept team invitation"
          buttonSize={ui.notificationButtonSize}
          colorPalette="warm"
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
  history: PropTypes.object.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  submitMutation: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  notification: PropTypes.object.isRequired
};

export default createFragmentContainer(
  connect()(withRouter(TeamInvite)),
  graphql`
    fragment TeamInvite_notification on NotifyTeamInvite {
      notificationId: id
      inviter {
        inviterName: preferredName
      }
      team {
        teamName: name
      }
    }`
);
