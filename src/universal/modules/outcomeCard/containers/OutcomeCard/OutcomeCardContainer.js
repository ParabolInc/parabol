import {convertToRaw, EditorState} from 'draft-js';
import {Set} from 'immutable';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {createFragmentContainer} from 'react-relay';
import editorDecorators from 'universal/components/TaskEditor/decorators';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import OutcomeCard from 'universal/modules/outcomeCard/components/OutcomeCard/OutcomeCard';
import DeleteTaskMutation from 'universal/mutations/DeleteTaskMutation';
import EditTaskMutation from 'universal/mutations/EditTaskMutation';
import UpdateTaskMutation from 'universal/mutations/UpdateTaskMutation';
import mergeServerContent from 'universal/utils/mergeServerContent';

class OutcomeCardContainer extends Component {
  constructor(props) {
    super(props);
    const {atmosphere: {userId}, contentState, task: {editors}} = props;
    this.state = {
      activeEditingComponents: Set(),
      cardHasHover: false,
      cardHasFocus: Boolean(editors.find((editor) => editor.userId === userId), editors, userId),
      editorState: EditorState.createWithContent(contentState, editorDecorators(this.getEditorState)),
      cardHasMenuOpen: false
    };
  }

  componentWillMount() {
    this._mounted = true;
  }

  componentWillReceiveProps(nextProps) {
    const {contentState: nextContentState} = nextProps;
    const {contentState: initialContentState} = this.props;
    if (initialContentState !== nextContentState) {
      const {editorState} = this.state;
      const newContentState = mergeServerContent(editorState, nextContentState);
      const newEditorState = EditorState.push(editorState, newContentState, 'insert-characters');
      this.setEditorState(newEditorState);
    }

    if (!this.props.isDragging && nextProps.isDragging) {
      this.handleCardUpdate();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const curEditingComponents = this.state.activeEditingComponents;
    const prevEditingComponents = prevState.activeEditingComponents;
    if (curEditingComponents.isEmpty() !== prevEditingComponents.isEmpty()) {
      this.announceEditing(!curEditingComponents.isEmpty());
    }
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  getEditorState = () => this.state.editorState;

  setEditorState = (editorState) => {
    const wasFocused = this.state.editorState.getSelection().getHasFocus();
    const isFocused = editorState.getSelection().getHasFocus();
    if (wasFocused !== isFocused) {
      this.trackEditingComponent('task-editor', isFocused);
      if (!isFocused) {
        this.handleCardUpdate();
      }
    }
    this.setState({
      editorState
    });
  };

  setEditorRef = (c) => {
    this.setState({
      editorRef: c
    });
  };

  trackEditingComponent = (uid, isEditing) => {
    this.setState((curState) => {
      const currentClients = curState.activeEditingComponents;
      const updatedClients = isEditing
        ? currentClients.add(uid)
        : currentClients.remove(uid);
      return {activeEditingComponents: updatedClients};
    });
  };

  toggleMenuState = () => {
    if (this._mounted) {
      this.setState({
        cardHasMenuOpen: !this.state.cardHasMenuOpen
      });
    }
  };

  handleCardUpdate = () => {
    const {cardHasMenuOpen, cardHasFocus, editorState} = this.state;
    const {area, atmosphere, task: {taskId, team: {teamId}}, contentState: initialContentState} = this.props;
    const contentState = editorState.getCurrentContent();
    if (!cardHasFocus && !contentState.hasText() && !cardHasMenuOpen) {
      // it's possible the user calls update, then delete, then the update timeout fires, so clear it here
      clearTimeout(this.updateTimer);
      DeleteTaskMutation(atmosphere, taskId, teamId);
    } else {
      const content = JSON.stringify(convertToRaw(contentState));
      const initialContent = JSON.stringify(convertToRaw(initialContentState));
      // TODO PR Draft-js to make it possible to compare entity maps. Adding a link should trigger a change
      if (content !== initialContent) {
        clearTimeout(this.updateTimer);
        this.updateTimer = setTimeout(() => {
          const updatedTask = {
            id: taskId,
            content
          };
          UpdateTaskMutation(atmosphere, updatedTask, area);
          this.updateTimer = undefined;
        }, 15);
      }
    }
  };

  handleCardMouseEnter = () => this.setState({cardHasHover: true});
  handleCardMouseLeave = () => this.setState({cardHasHover: false});

  handleCardBlur = (e) => {
    const cb = !e.currentTarget.contains(e.relatedTarget) ? this.handleCardUpdate : undefined;
    this.setState({cardHasFocus: false}, cb);
  };

  handleCardFocus = () => this.setState({cardHasFocus: true});

  announceEditing = (isEditing) => {
    const {atmosphere, task: {taskId}} = this.props;
    EditTaskMutation(atmosphere, taskId, isEditing);
  };

  render() {
    const {activeEditingComponents, cardHasFocus, cardHasHover, cardHasMenuOpen, editorRef, editorState} = this.state;
    const {area, handleAddTask, hasDragStyles, isAgenda, task, isDragging} = this.props;
    return (
      <div
        tabIndex={-1}
        style={{outline: 'none'}}
        ref={(c) => {
          this.ref = c;
        }}
        onBlur={this.handleCardBlur}
        onFocus={this.handleCardFocus}
        onMouseEnter={this.handleCardMouseEnter}
        onMouseLeave={this.handleCardMouseLeave}
      >
        <OutcomeCard
          area={area}
          editorRef={editorRef}
          editorState={editorState}
          cardHasHover={cardHasHover}
          cardHasFocus={cardHasFocus}
          cardHasMenuOpen={cardHasMenuOpen}
          handleAddTask={handleAddTask}
          hasDragStyles={hasDragStyles}
          isAgenda={isAgenda}
          isDragging={isDragging}
          isEditing={!activeEditingComponents.isEmpty()}
          task={task}
          setEditorRef={this.setEditorRef}
          setEditorState={this.setEditorState}
          trackEditingComponent={this.trackEditingComponent}
          toggleMenuState={this.toggleMenuState}
        />
      </div>
    );
  }
}

OutcomeCardContainer.propTypes = {
  area: PropTypes.string,
  atmosphere: PropTypes.object.isRequired,
  contentState: PropTypes.object.isRequired,
  handleAddTask: PropTypes.func,
  task: PropTypes.object.isRequired,
  hasDragStyles: PropTypes.bool,
  isAgenda: PropTypes.bool,
  isDragging: PropTypes.bool
};

export default createFragmentContainer(
  withAtmosphere(OutcomeCardContainer),
  graphql`
    fragment OutcomeCardContainer_task on Task {
      editors {
        userId
      }
      taskId: id
      team {
        teamId: id
      }
      ...OutcomeCard_task
    }`
);
