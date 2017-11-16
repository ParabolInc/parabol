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
  const {id, team} = notification;
  const {id: teamId, name: teamName} = team;
  const {id: dbNotificationId} = fromGlobalId(id);
  const acknowledge = () => {
    submitMutation();
    ClearNotificationMutation(atmosphere, dbNotificationId, onError, onCompleted);
  };
  const goToTeam = () => {
    submitMutation();
    ClearNotificationMutation(atmosphere, dbNotificationId, onError, onCompleted);
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
          aria-label="Clear this notification"
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
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    team: PropTypes.object.isRequired
  })
};

const styleThunk = () => ({
  ...defaultStyles
});

export default withRouter(withStyles(styleThunk)(AddedToTeam));
