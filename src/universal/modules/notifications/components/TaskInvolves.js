import {css} from 'aphrodite-local-styles/no-important';
import {convertFromRaw, Editor, EditorState} from 'draft-js';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {createFragmentContainer} from 'react-relay';
import withRouter from 'react-router-dom/es/withRouter';
import Button from 'universal/components/Button/Button';
import IconAvatar from 'universal/components/IconAvatar/IconAvatar';
import editorDecorators from 'universal/components/TaskEditor/decorators';
import Row from 'universal/components/Row/Row';
import defaultStyles from 'universal/modules/notifications/helpers/styles';
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation';
import appTheme from 'universal/styles/theme/appTheme';
import labels from 'universal/styles/theme/labels';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {ACTIVE, ASSIGNEE, DONE, FUTURE, MENTIONEE, STUCK} from 'universal/utils/constants';
import {clearNotificationLabel} from '../helpers/constants';

const involvementWord = {
  [ASSIGNEE]: 'assigned',
  [MENTIONEE]: 'mentioned'
};

class TaskInvolves extends Component {
  constructor(props) {
    super(props);
    const {notification: {task: {content}}} = props;
    const contentState = convertFromRaw(JSON.parse(content));
    this.state = {
      editorState: EditorState.createWithContent(contentState, editorDecorators(this.getEditorState))
    };
  }

  componentWillReceiveProps(nextProps) {
    const {notification: {task: {content: oldContent}}} = this.props;
    const {notification: {task: {content}}} = nextProps;
    if (content !== oldContent) {
      const contentState = convertFromRaw(JSON.parse(content));
      this.setState({
        editorState: EditorState.createWithContent(contentState, editorDecorators(this.getEditorState))
      });
    }
  }

  getEditorState = () => this.state.editorState;

  acknowledge = () => {
    const {
      atmosphere,
      notification,
      submitMutation,
      onError,
      onCompleted
    } = this.props;
    const {notificationId} = notification;
    submitMutation();
    ClearNotificationMutation(atmosphere, notificationId, onError, onCompleted);
  };
  gotoBoard = () => {
    const {
      atmosphere,
      notification,
      submitMutation,
      onError,
      onCompleted,
      history
    } = this.props;
    const {notificationId, task, team} = notification;
    const {tags} = task;
    const {teamId} = team;
    submitMutation();
    ClearNotificationMutation(atmosphere, notificationId, onError, onCompleted);
    const archiveSuffix = tags.includes('archived') ? '/archive' : '';
    history.push(`/team/${teamId}${archiveSuffix}`);
  };

  render() {
    const {editorState} = this.state;
    const {
      styles,
      notification,
      submitting
    } = this.props;
    const {team, task, involvement, changeAuthor: {changeAuthorName}} = notification;
    const {teamName} = team;
    const {status, tags, assignee} = task;
    const action = involvementWord[involvement];
    const taskStyles = css(
      styles.taskListView,
      styles[status],
      tags.includes('private') && styles.private
    );
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
            <span>{' a task for '}</span>
            <span
              className={css(styles.messageVar, styles.notifLink)}
              onClick={this.gotoBoard}
              title={`Go to ${teamName}’s Board`}
            >
              {teamName}
            </span>
            <span>{':'}</span>
          </div>
          <div className={taskStyles}>
            <Editor
              readOnly
              editorState={editorState}
            />
            {assignee &&
            <div className={css(styles.owner)}>
              <img alt="Avatar" className={css(styles.ownerAvatar)} src={assignee.picture} />
              <div className={css(styles.ownerName)}>
                {assignee.preferredName}
              </div>
            </div>
            }
          </div>
        </div>
        <div className={css(styles.buttonGroup)}>
          <div className={css(styles.widerButton)}>
            <Button
              aria-label="Go to this board"
              colorPalette="warm"
              isBlock
              label="Go to Board"
              buttonSize={ui.notificationButtonSize}
              type="submit"
              onClick={this.gotoBoard}
              waiting={submitting}
            />
          </div>
          <div className={css(styles.iconButton)}>
            <Button
              aria-label={clearNotificationLabel}
              buttonSize="small"
              colorPalette="gray"
              icon="check"
              isBlock
              onClick={this.acknowledge}
              type="submit"
            />
          </div>
        </div>
      </Row>
    );
  }
}

TaskInvolves.propTypes = {
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
  ...defaultStyles,

  taskListView: {
    backgroundColor: appTheme.palette.mid10l,
    borderRadius: ui.borderRadiusMedium,
    borderLeft: '.25rem solid',
    margin: '.25rem 0 0',
    padding: '.5rem'
  },

  [ACTIVE]: {
    borderColor: labels.taskStatus[ACTIVE].color
  },

  [STUCK]: {
    borderColor: labels.taskStatus[STUCK].color
  },

  [DONE]: {
    borderColor: labels.taskStatus[DONE].color
  },

  [FUTURE]: {
    borderColor: labels.taskStatus[FUTURE].color
  },

  private: {
    backgroundColor: ui.privateCardBgColor
  }
});

export default createFragmentContainer(
  withRouter(withStyles(styleThunk)(TaskInvolves)),
  graphql`
    fragment TaskInvolves_notification on NotifyTaskInvolves {
      notificationId: id
      changeAuthor {
        changeAuthorName: preferredName
      }
      involvement
      team {
        teamId: id
        teamName: name
      }
      task {
        content
        status
        tags
        assignee {
          ...on TeamMember {
            picture
            preferredName
          }
        }
      }
    }
  `
);
