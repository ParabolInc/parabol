import {css} from 'react-emotion';
import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import {withRouter} from 'react-router-dom';
import AcknowledgeButton from 'universal/modules/notifications/components/AcknowledgeButton/AcknowledgeButton';
import defaultStyles from 'universal/modules/notifications/helpers/styles';
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation';
import {clearNotificationLabel} from '../../helpers/constants';
import Row from 'universal/components/Row/Row';
import IconAvatar from 'universal/components/IconAvatar/IconAvatar';

const AddedToTeam = (props) => {
  const {
    atmosphere,
    history,
    notification,
    submitting,
    submitMutation,
    onError,
    onCompleted
  } = props;
  const {notificationId, team} = notification;
  const {teamId, teamName} = team;
  const acknowledge = () => {
    submitMutation();
    ClearNotificationMutation(atmosphere, notificationId, onError, onCompleted);
  };
  const goToTeam = () => {
    submitMutation();
    ClearNotificationMutation(atmosphere, notificationId, onError, onCompleted);
    history.push(`/team/${teamId}`);
  };
  return (
    <Row compact>
      <div className={css(defaultStyles.icon)}>
        <IconAvatar icon="users" size="small" />
      </div>
      <div className={css(defaultStyles.message)}>
        {'Congratulations! You are now a part of the team '}
        <span className={css(defaultStyles.messageVar, defaultStyles.notifLink)} onClick={goToTeam}>
          {teamName}
        </span>
        {'.'}
      </div>
      <div className={css(defaultStyles.iconButton)}>
        <AcknowledgeButton
          aria-label={clearNotificationLabel}
          onClick={acknowledge}
          waiting={submitting}
        />
      </div>
    </Row>
  );
};

AddedToTeam.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  submitMutation: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  notification: PropTypes.object.isRequired
};

export default createFragmentContainer(
  withRouter(AddedToTeam),
  graphql`
    fragment AddedToTeam_notification on NotifyAddedToTeam {
      notificationId: id
      team {
        teamId: id
        teamName: name
      }
    }
  `
);
