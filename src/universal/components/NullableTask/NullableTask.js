import {convertFromRaw} from 'draft-js';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import NullCard from 'universal/components/NullCard/NullCard';
import OutcomeCardContainer from 'universal/modules/outcomeCard/containers/OutcomeCard/OutcomeCardContainer';
import {createFragmentContainer} from 'react-relay';

class NullableTask extends Component {
  static propTypes = {
    area: PropTypes.string,
    hasDragStyles: PropTypes.bool,
    handleAddTask: PropTypes.func,
    isAgenda: PropTypes.bool,
    isDragging: PropTypes.bool,
    myUserId: PropTypes.string,
    task: PropTypes.object
  };

  state = {
    contentState: convertFromRaw(JSON.parse(this.props.task.content))
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.task.content !== this.props.task.content) {
      this.setState({
        contentState: convertFromRaw(JSON.parse(nextProps.task.content))
      });
    }
  }

  shouldComponentUpdate(nextProps) {
    return Boolean(!nextProps.isPreview ||
      nextProps.task.status !== this.props.task.status ||
      nextProps.task.content !== this.props.task.content
    );
  }

  render() {
    const {area, handleAddTask, hasDragStyles, isAgenda, myUserId, task, isDragging} = this.props;
    const {contentState} = this.state;
    const {createdBy, assignee: {preferredName}} = task;
    const showOutcome = contentState.hasText() || createdBy === myUserId;
    return showOutcome ?
      <OutcomeCardContainer
        area={area}
        contentState={contentState}
        handleAddTask={handleAddTask}
        hasDragStyles={hasDragStyles}
        isDragging={isDragging}
        isAgenda={isAgenda}
        task={task}
        myUserId={myUserId}
      /> :
      <NullCard preferredName={preferredName} />;
  }
}

export default createFragmentContainer(
  NullableTask,
  graphql`
    fragment NullableTask_task on Task {
      content
      createdBy
      status
      assignee {
        ... on TeamMember {
          preferredName
        }
      }
      ...OutcomeCardContainer_task
    }`
);
