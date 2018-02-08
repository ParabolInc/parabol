import {css} from 'aphrodite-local-styles/no-important';
import {convertToRaw} from 'draft-js';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {MenuItem} from 'universal/modules/menu';
import {textOverflow} from 'universal/styles/helpers';
import labels from 'universal/styles/theme/labels';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import addTagToTask from 'universal/utils/draftjs/addTagToTask';
import UpdateTaskMutation from 'universal/mutations/UpdateTaskMutation';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import DeleteTaskMutation from 'universal/mutations/DeleteTaskMutation';
import {createFragmentContainer} from 'react-relay';

const statusItems = labels.taskStatus.slugs.slice();

class OutcomeCardStatusMenu extends Component {
  makeAddTagToTask = (tag) => () => {
    const {area, atmosphere, task: {taskId}, editorState} = this.props;
    const contentState = editorState.getCurrentContent();
    const newContent = addTagToTask(contentState, tag);
    const rawContentStr = JSON.stringify(convertToRaw(newContent));
    const updatedTask = {
      id: taskId,
      content: rawContentStr
    };
    UpdateTaskMutation(atmosphere, updatedTask, area);
  };

  deleteOutcome = () => {
    const {atmosphere, onComplete, task: {taskId, teamId}} = this.props;
    DeleteTaskMutation(atmosphere, taskId, teamId);
    if (onComplete) {
      onComplete();
    }
  };

  itemFactory = () => {
    const {closePortal, isAgenda, isPrivate, removeContentTag, styles, task: {taskStatus}} = this.props;
    const listItems = statusItems
      .filter((status) => status !== taskStatus)
      .map((status) => {
        const {color, icon, label} = labels.taskStatus[status];
        return (
          <MenuItem
            icon={icon}
            iconColor={color}
            key={status}
            label={<div className={css(styles.label)}>{'Move to '}<b style={{color}}>{label}</b></div>}
            onClick={this.handleTaskUpdateFactory(status)}
            closePortal={closePortal}
          />
        );
      });
    listItems.push(isPrivate ?
      (<MenuItem
        hr="before"
        icon="lock"
        key="private"
        label={<div className={css(styles.label)}>{'Remove '}<b>{'#private'}</b></div>}
        onClick={removeContentTag('private')}
        closePortal={closePortal}
      />) :
      (<MenuItem
        hr="before"
        icon="lock"
        key="private"
        label={<div className={css(styles.label)}>{'Set as '}<b>{'#private'}</b></div>}
        onClick={this.makeAddTagToTask('#private')}
        closePortal={closePortal}
      />)
    );
    listItems.push(isAgenda ?
      (<MenuItem
        icon="times"
        key="delete"
        label={<div className={css(styles.label)}>{'Delete this Task'}</div>}
        onClick={this.deleteOutcome}
        closePortal={closePortal}
      />) :
      (<MenuItem
        icon="archive"
        key="archive"
        label={<div className={css(styles.label)}>{'Set as '}<b>{'#archived'}</b></div>}
        onClick={this.makeAddTagToTask('#archived')}
        closePortal={closePortal}
      />));
    return listItems;
  };

  handleTaskUpdateFactory = (newStatus) => () => {
    const {area, atmosphere, onComplete, task} = this.props;
    const {taskId, taskStatus} = task;
    if (newStatus === taskStatus) {
      return;
    }
    const updatedTask = {
      id: taskId,
      status: newStatus
    };
    UpdateTaskMutation(atmosphere, updatedTask, area);
    if (onComplete) {
      onComplete();
    }
  };


  render() {
    return (
      <div>
        {this.itemFactory()}
      </div>
    );
  }
}

OutcomeCardStatusMenu.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  area: PropTypes.string.isRequired,
  closePortal: PropTypes.func.isRequired,
  editorState: PropTypes.object,
  task: PropTypes.object,
  isAgenda: PropTypes.bool,
  isPrivate: PropTypes.bool,
  onComplete: PropTypes.func,
  removeContentTag: PropTypes.func.isRequired,
  styles: PropTypes.object
};

const styleThunk = () => ({
  label: {
    ...textOverflow,
    fontSize: ui.menuItemFontSize,
    lineHeight: ui.menuItemHeight,
    padding: `0 ${ui.menuGutterHorizontal} 0 0`
  }
});

export default createFragmentContainer(
  withAtmosphere(withStyles(styleThunk)(OutcomeCardStatusMenu)),
  graphql`
    fragment OutcomeCardStatusMenu_task on Task {
      taskId: id
      taskStatus: status
      teamId
    }`
);
