import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import withRouter from 'react-router-dom/es/withRouter';
import Button from 'universal/components/Button/Button';
import IconAvatar from 'universal/components/IconAvatar/IconAvatar';
import Row from 'universal/components/Row/Row';
import defaultStyles from 'universal/modules/notifications/helpers/styles';
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {ASSIGNEE, MENTIONEE} from 'universal/utils/constants';
import fromGlobalId from 'universal/utils/relay/fromGlobalId';

const involvementWord = {
  [ASSIGNEE]: 'assigned',
  [MENTIONEE]: 'mentioned'
};

const ProjectInvolves = (props) => {
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
  const {id, team, project, involvement, changeAuthor: {preferredName: changeAuthorName}} = notification;
  const {id: teamId, name: teamName} = team;
  const {id: dbNotificationId} = fromGlobalId(id);
  const acknowledge = () => {
    submitMutation();
    ClearNotificationMutation(atmosphere, dbNotificationId, onError, onCompleted);
  };
  const gotoBoard = () => {
    submitMutation();
    ClearNotificationMutation(atmosphere, dbNotificationId, onError, onCompleted);
    history.push(`/team/${teamId}`);
  };
  const action = involvementWord[involvement];
  return (
    <Row>
      <div className={css(styles.icon)}>
        <IconAvatar icon="check-square" size="medium"/>
      </div>
      <div className={css(styles.message)}>
        <div className={css(styles.messageText)}>
          <span className={css(styles.messageVar)}>{changeAuthorName}</span>
          <span>{' has'}</span>
          <span className={css(styles.messageVar)}> {` ${action} you`} </span>
          {involvement === MENTIONEE ? ' in' : ''}
          <span>{' a project for'}</span>
          <span className={css(styles.messageVar)}> {teamName} </span>
          <span>{'.'}</span>
        </div>
        <div className={css(styles.projectListView)}>
          I am a card!
        </div>
      </div>
      <div className={css(styles.buttonGroup)}>
        <div className={css(styles.button)}>
          <Button
            colorPalette="cool"
            isBlock
            label="Go to board"
            buttonSize={ui.notificationButtonSize}
            type="submit"
            onClick={gotoBoard}
            waiting={submitting}
          />
        </div>
        <div className={css(styles.button)}>
          <Button
            colorPalette="gray"
            isBlock
            label="OK"
            buttonSize="small"
            type="submit"
            onClick={acknowledge}
          />
        </div>
      </div>
    </Row>
  );
};

ProjectInvolves.propTypes = {
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

export default withRouter(withStyles(styleThunk)(ProjectInvolves));
