import {convertFromRaw, Editor, EditorState} from 'draft-js';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {createFragmentContainer} from 'react-relay';
import withRouter from 'react-router-dom/es/withRouter';
import OutcomeCardStatusIndicator from 'universal/modules/outcomeCard/components/OutcomeCardStatusIndicator/OutcomeCardStatusIndicator';
import editorDecorators from 'universal/components/TaskEditor/decorators';
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import {ASSIGNEE, MENTIONEE} from 'universal/utils/constants';
import {clearNotificationLabel} from '../helpers/constants';
import {css} from 'react-emotion';
import defaultStyles from 'universal/modules/notifications/helpers/styles';
import Row from 'universal/components/Row/Row';
import IconAvatar from 'universal/components/IconAvatar/IconAvatar';
import Button from 'universal/components/Button/Button';

const involvementWord = {
  [ASSIGNEE]: 'assigned',
  [MENTIONEE]: 'mentioned'
};

const localStyles = {
  taskListView: {
    backgroundColor: appTheme.palette.light,
    borderRadius: ui.cardBorderRadius,
    margin: '.25rem 0 0',
    padding: '.5rem'
  },

  indicatorsBlock: {
    display: 'flex',
    margin: '0 0 .5rem'
  }
};

class TaskInvolves extends Component {
  constructor (props) {
    super(props);
    const {
      notification: {
        task: {content}
      }
    } = props;
    const contentState = convertFromRaw(JSON.parse(content));
    this.state = {
      editorState: EditorState.createWithContent(
        contentState,
        editorDecorators(this.getEditorState)
      )
    };
  }

  componentWillReceiveProps (nextProps) {
    const {
      notification: {
        task: {content: oldContent}
      }
    } = this.props;
    const {
      notification: {
        task: {content}
      }
    } = nextProps;
    if (content !== oldContent) {
      const contentState = convertFromRaw(JSON.parse(content));
      this.setState({
        editorState: EditorState.createWithContent(
          contentState,
          editorDecorators(this.getEditorState)
        )
      });
    }
  }

  getEditorState = () => this.state.editorState;

  acknowledge = () => {
    const {atmosphere, notification, submitMutation, onError, onCompleted} = this.props;
    const {notificationId} = notification;
    submitMutation();
    ClearNotificationMutation(atmosphere, notificationId, onError, onCompleted);
  };
  gotoBoard = () => {
    const {atmosphere, notification, submitMutation, onError, onCompleted, history} = this.props;
    const {notificationId, task, team} = notification;
    const {tags} = task;
    const {teamId} = team;
    submitMutation();
    ClearNotificationMutation(atmosphere, notificationId, onError, onCompleted);
    const archiveSuffix = tags.includes('archived') ? '/archive' : '';
    history.push(`/team/${teamId}${archiveSuffix}`);
  };

  render () {
    const {editorState} = this.state;
    const {notification, submitting} = this.props;
    const {
      team,
      task,
      involvement,
      changeAuthor: {changeAuthorName}
    } = notification;
    const {teamName} = team;
    const {status, tags, assignee} = task;
    const action = involvementWord[involvement];
    return (
      <Row compact>
        <div className={css(defaultStyles.icon)}>
          <IconAvatar icon={involvement === MENTIONEE ? 'at' : 'id-card-o'} size="small" />
        </div>
        <div className={css(defaultStyles.message)}>
          <div className={css(defaultStyles.messageText)}>
            <b>{changeAuthorName}</b>
            <span>{' has '}</span>
            <b>
              <i>{`${action} you`}</i>
            </b>
            {involvement === MENTIONEE ? ' in' : ''}
            <span>{' a task for '}</span>
            <span
              className={css(defaultStyles.messageVar, defaultStyles.notifLink)}
              onClick={this.gotoBoard}
              title={`Go to ${teamName}’s Board`}
            >
              {teamName}
            </span>
            <span>{':'}</span>
          </div>
          <div className={css(localStyles.taskListView)}>
            <div className={css(localStyles.indicatorsBlock)}>
              <OutcomeCardStatusIndicator status={status} />
              {tags.includes('private') && <OutcomeCardStatusIndicator status="private" />}
              {tags.includes('archived') && <OutcomeCardStatusIndicator status="archived" />}
            </div>
            <Editor readOnly editorState={editorState} />
            {assignee && (
              <div className={css(defaultStyles.owner)}>
                <img
                  alt="Avatar"
                  className={css(defaultStyles.ownerAvatar)}
                  src={assignee.picture}
                />
                <div className={css(defaultStyles.ownerName)}>{assignee.preferredName}</div>
              </div>
            )}
          </div>
        </div>
        <div className={css(defaultStyles.buttonGroup)}>
          <div className={css(defaultStyles.widerButton)}>
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
          <div className={css(defaultStyles.iconButton)}>
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
  submitMutation: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  notification: PropTypes.object.isRequired
};

export default createFragmentContainer(
  withRouter(TaskInvolves),
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
          ... on TeamMember {
            picture
            preferredName
          }
        }
      }
    }
  `
);
