import {css} from 'react-emotion';
import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import {withRouter} from 'react-router-dom';
import AcknowledgeButton from 'universal/modules/notifications/components/AcknowledgeButton/AcknowledgeButton';
import defaultStyles from 'universal/modules/notifications/helpers/styles';
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation';
import {clearNotificationLabel} from '../helpers/constants';
import Row from 'universal/components/Row/Row';
import IconAvatar from 'universal/components/IconAvatar/IconAvatar';

const InviteeApproved = (props) => {
  const {atmosphere, notification, submitMutation, onError, onCompleted, history} = props;
  const {notificationId, inviteeEmail, team} = notification;
  const {teamId, teamName} = team;
  const acknowledge = () => {
    submitMutation();
    ClearNotificationMutation(atmosphere, notificationId, onError, onCompleted);
  };
  const goToTeam = () => history.push(`/team/${teamId}`);
  return (
    <Row compact>
      <div className={css(defaultStyles.icon)}>
        <IconAvatar icon="user-circle-o" size="small" />
      </div>
      <div className={css(defaultStyles.message)}>
        <b>{inviteeEmail}</b>
        {' has been approved to join '}
        <span className={css(defaultStyles.messageVar, defaultStyles.notifLink)} onClick={goToTeam}>
          {teamName}
        </span>
        {'.'}
        <br />
        {'We have sent them an invitation.'}
      </div>
      <div className={css(defaultStyles.iconButton)}>
        <AcknowledgeButton aria-label={clearNotificationLabel} onClick={acknowledge} />
      </div>
    </Row>
  );
};

InviteeApproved.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  submitMutation: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  notification: PropTypes.object.isRequired
};

export default createFragmentContainer(
  withRouter(InviteeApproved),
  graphql`
    fragment InviteeApproved_notification on NotifyInviteeApproved {
      notificationId: id
      inviteeEmail
      team {
        teamId: id
        teamName: name
      }
    }
  `
);
