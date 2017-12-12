import PropTypes from 'prop-types';
import React, { Component } from 'react';
import NullableProject from 'universal/components/NullableProject/NullableProject';
import {PROJECT} from 'universal/utils/constants';
import {DragSource as dragSource} from 'react-dnd';
import {getEmptyImage} from 'react-dnd-html5-backend';
import ProjectDragLayer from './ProjectDragLayer';
import {createFragmentContainer} from 'react-relay';

const projectSource = {
  beginDrag(props) {
    return {
      id: props.project.id,
      status: props.project.status
    };
  },
  isDragging(props, monitor) {
    return props.project.id === monitor.getItem().id;
  }
};

const importantProps = ['content', 'status', 'teamMember', 'sortOrder', 'integration'];

class DraggableProject extends Component {
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
      if (nextProps.project[key] !== this.props.project[key]) {
        return true;
      }
    }
    return isDragging !== this.props.isDragging;
  }

  render() {
    const {area, connectDragSource, isDragging, myUserId, project} = this.props;
    return connectDragSource(
      <div>
        {isDragging &&
          <ProjectDragLayer
            area={area}
            project={project}
          />
        }
        <div style={{opacity: isDragging ? 0.5 : 1}}>
          <NullableProject
            area={area}
            project={project}
            myUserId={myUserId}
            isDragging={isDragging}
          />
        </div>
      </div>
    );
  }
}


DraggableProject.propTypes = {
  area: PropTypes.string,
  connectDragSource: PropTypes.func,
  connectDragPreview: PropTypes.func,
  isDragging: PropTypes.bool,
  isPreview: PropTypes.bool,
  myUserId: PropTypes.string,
  project: PropTypes.shape({
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

export default createFragmentContainer(
  dragSource(PROJECT, projectSource, dragSourceCb)(DraggableProject),
  graphql`
    fragment DraggableProject_project on Project {
      id
      content
      integration {
        service
      }
      status
      sortOrder
      teamMember {
        id
      }
      ...NullableProject_project
    }`
);
