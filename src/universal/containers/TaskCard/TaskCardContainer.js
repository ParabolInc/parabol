import PropTypes from 'prop-types';
import React, { Component } from 'react';
import OutcomeOrNullCard from 'universal/components/OutcomeOrNullCard/OutcomeOrNullCard';
import {TASK} from 'universal/utils/constants';
import {DragSource as dragSource} from 'react-dnd';
import {getEmptyImage} from 'react-dnd-html5-backend';
import TaskDragLayer from './TaskDragLayer';

const taskSource = {
  beginDrag(props) {
    return {
      id: props.task.id,
      status: props.task.status
    };
  },
  isDragging(props, monitor) {
    return props.task.id === monitor.getItem().id;
  }
};

const importantProps = ['content', 'status', 'teamMemberId', 'sortOrder', 'integration'];

class TaskCardContainer extends Component {
  componentDidMount() {
    const {connectDragPreview, isPreview} = this.props;
    if (!isPreview) {
      connectDragPreview(getEmptyImage());
    }
  }

  shouldComponentUpdate(nextProps) {
    const {isDragging} = nextProps;
    for (let i = 0; i < importantProps.length; i++) {
      const key = importantProps[i];
      if (nextProps.task[key] !== this.props.task[key]) {
        return true;
      }
    }
    return isDragging !== this.props.isDragging;
  }

  render() {
    const {area, connectDragSource, isDragging, myUserId, task} = this.props;
    return connectDragSource(
      <div>
        {isDragging &&
          <TaskDragLayer
            area={area}
            outcome={task}
          />
        }
        <div style={{opacity: isDragging ? 0.5 : 1}}>
          <OutcomeOrNullCard
            area={area}
            outcome={task}
            myUserId={myUserId}
            isDragging={isDragging}
          />
        </div>
      </div>
    );
  }
}


TaskCardContainer.propTypes = {
  area: PropTypes.string,
  connectDragSource: PropTypes.func,
  connectDragPreview: PropTypes.func,
  dispatch: PropTypes.func,
  isDragging: PropTypes.bool,
  isPreview: PropTypes.bool,
  myUserId: PropTypes.string,
  preferredName: PropTypes.string,
  username: PropTypes.string,
  task: PropTypes.shape({
    id: PropTypes.string,
    content: PropTypes.string,
    status: PropTypes.string,
    teamMemberId: PropTypes.string
  })
};

const dragSourceCb = (connectSource, monitor) => ({
  connectDragSource: connectSource.dragSource(),
  connectDragPreview: connectSource.dragPreview(),
  isDragging: monitor.isDragging()
});

export default dragSource(TASK, taskSource, dragSourceCb)(TaskCardContainer);
