import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import Button from 'universal/components/Button/Button';
import IconAvatar from 'universal/components/IconAvatar/IconAvatar';
import Row from 'universal/components/Row/Row';
import defaultStyles from 'universal/modules/notifications/helpers/styles';
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {withRouter} from 'react-router-dom';
import {clearNotificationLabel} from '../../helpers/constants';

const AddedToTeam = (props) => {
  const {
    atmosphere,
    history,
    styles,
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
      <div className={css(styles.icon)}>
        <IconAvatar icon="users" size="small" />
      </div>
      <div className={css(styles.message)}>
        {'Congratulations! You are now a part of the team '}
        <span
          className={css(styles.messageVar, styles.notifLink)}
          onClick={goToTeam}
        >
          {teamName}
        </span>{'.'}
      </div>
      <div className={css(styles.iconButton)}>
        <Button
          aria-label={clearNotificationLabel}
          buttonSize={ui.notificationButtonSize}
          colorPalette="gray"
          icon="check"
          isBlock
          onClick={acknowledge}
          type="submit"
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
  styles: PropTypes.object,
  submitMutation: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  notification: PropTypes.object.isRequired
};

const styleThunk = () => ({
  ...defaultStyles
});

export default createFragmentContainer(
  withRouter(withStyles(styleThunk)(AddedToTeam)),
  graphql`
    fragment AddedToTeam_notification on Notification {
      notificationId: id
      ... on NotifyAddedToTeam {
        team {
          teamId: id
          teamName: name
        }
      }
    }
  `
);
