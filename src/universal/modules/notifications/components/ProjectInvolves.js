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
import appTheme from 'universal/styles/theme/appTheme';
import labels from 'universal/styles/theme/labels';
import {ACTIVE, DONE, FUTURE, STUCK} from 'universal/utils/constants';
import withStyles from 'universal/styles/withStyles';
import {ASSIGNEE, MENTIONEE} from 'universal/utils/constants';
import fromGlobalId from 'universal/utils/relay/fromGlobalId';
import {Editor, convertFromRaw, EditorState} from 'draft-js';
import editorDecorators from 'universal/components/ProjectEditor/decorators';

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
  const {content, status, tags, teamMember} = project;
  const {id: dbNotificationId} = fromGlobalId(id);
  const acknowledge = () => {
    submitMutation();
    ClearNotificationMutation(atmosphere, dbNotificationId, onError, onCompleted);
  };
  const gotoBoard = () => {
    submitMutation();
    ClearNotificationMutation(atmosphere, dbNotificationId, onError, onCompleted);
    const archiveSuffix = tags.includes('archived') ? '/archive' : '';
    history.push(`/team/${teamId}${archiveSuffix}`);
  };
  const action = involvementWord[involvement];
  const contentState = convertFromRaw(JSON.parse(content));
  const editorState = EditorState.createWithContent(contentState, editorDecorators);
  return (
    <Row compact>
      <div className={css(styles.icon)}>
        <IconAvatar icon={involvement === MENTIONEE ? 'at' : 'id-card-o'} size="small" />
      </div>
      <div className={css(styles.message)}>
        <div className={css(styles.messageText)}>
          <b>{changeAuthorName}</b>
          <span>{' has '}</span>
          <b><i>{`${action} you`}</i></b>
          {involvement === MENTIONEE ? ' in' : ''}
          <span>{' a project for '}</span>
          <span className={css(styles.messageVar, styles.notifLink)} onClick={gotoBoard} title={`Go to ${teamName}’s Board`}>
            {teamName}
          </span>
          <span>{'.'}</span>
        </div>
        <div className={css(styles.projectListView, styles[status])}>
          <Editor
            readOnly
            editorState={editorState}
          />
          <div className={css(styles.owner)}>
            <img alt="Avatar" className={css(styles.ownerAvatar)} src={teamMember.picture} />
            <div className={css(styles.ownerName)}>
              {teamMember.preferredName}
            </div>
          </div>
        </div>
      </div>
      <div className={css(styles.buttonGroup)}>
        <div className={css(styles.widerButton)}>
          <Button
            colorPalette="cool"
            isBlock
            label="Go to Board"
            buttonSize={ui.notificationButtonSize}
            title="Clear this notification"
            type="submit"
            onClick={gotoBoard}
            waiting={submitting}
          />
        </div>
        <div className={css(styles.iconButton)}>
          <Button
            aria-label="Clear this notification"
            buttonSize="small"
            colorPalette="gray"
            icon="check"
            isBlock
            onClick={acknowledge}
            type="submit"
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
  ...defaultStyles,

  projectListView: {
    backgroundColor: appTheme.palette.mid10l,
    borderRadius: ui.borderRadiusMedium,
    borderLeft: '.25rem solid',
    margin: '.25rem 0 0',
    padding: '.5rem'
  },

  [ACTIVE]: {
    borderColor: labels.projectStatus[ACTIVE].color
  },

  [STUCK]: {
    borderColor: labels.projectStatus[STUCK].color
  },

  [DONE]: {
    borderColor: labels.projectStatus[DONE].color
  },

  [FUTURE]: {
    borderColor: labels.projectStatus[FUTURE].color
  }
});

export default withRouter(withStyles(styleThunk)(ProjectInvolves));
