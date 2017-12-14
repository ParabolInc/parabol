import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {findDOMNode} from 'react-dom';
import NullableProject from 'universal/components/NullableProject/NullableProject';
import {PROJECT} from 'universal/utils/constants';
import {DragSource as dragSource, DropTarget as dropTarget} from 'react-dnd';
import {getEmptyImage} from 'react-dnd-html5-backend';
import ProjectDragLayer from './ProjectDragLayer';
import {createFragmentContainer} from 'react-relay';

const importantProjectProps = [
  'content',
  'status',
  'teamMember',
  'sortOrder',
  'integration'
];

class DraggableProject extends Component {
  componentDidMount() {
    const {connectDragPreview, isPreview} = this.props;
    if (!isPreview) {
      connectDragPreview(getEmptyImage());
    }
  }

  shouldComponentUpdate(nextProps) {
    const {isDragging} = nextProps;
    for (let i = 0; i < importantProjectProps.length; i++) {
      const key = importantProjectProps[i];
      if (nextProps.project[key] !== this.props.project[key]) {
        return true;
      }
    }
    return isDragging !== this.props.isDragging;
  }

  render() {
    const {
      area,
      connectDragSource,
      connectDropTarget,
      isDragging,
      myUserId,
      project
    } = this.props;
    return connectDropTarget(
      connectDragSource(
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
      )
    );
  }
}


DraggableProject.propTypes = {
  area: PropTypes.string,
  connectDragSource: PropTypes.func,
  connectDragPreview: PropTypes.func,
  connectDropTarget: PropTypes.func.isRequired,
  insert: PropTypes.func.isRequired,
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

const projectDragSpec = {
  beginDrag(props) {
    return props.project;
  },
  isDragging(props, monitor) {
    return props.project.id === monitor.getItem().id;
  }
};

const projectDragCollect = (connectSource, monitor) => ({
  connectDragSource: connectSource.dragSource(),
  connectDragPreview: connectSource.dragPreview(),
  isDragging: monitor.isDragging()
});

let lastDraggedProjectId;
let lastDropTargetProjectId;
let lastBefore;
const handleProjectHover = (props, monitor, component) => {
  const {insert, project} = props;
  const dropTargetProjectId = project.id;
  const draggedProject = monitor.getItem();
  const draggedProjectId = draggedProject.id;

  // Don't drag-and-drop on ourselves
  if (draggedProjectId === dropTargetProjectId) {
    return;
  }

  // Compute whether I am dropping "before" or "after" the card.
  const {y: mouseY} = monitor.getClientOffset();
  const {
    top: dropTargetTop,
    height: dropTargetHeight
  } = findDOMNode(component).getBoundingClientRect(); // eslint-disable-line react/no-find-dom-node
  const dropTargetMidpoint = dropTargetTop + (dropTargetHeight / 2);
  const before = mouseY < dropTargetMidpoint;

  // We're sort of memoizing here, since this hover function gets called
  // constantly during a drag operation; if the last dragged project and drop
  // target projects are the same with the same before/after relationship, then
  // we don't need to re-insert them.
  if (!monitor.isOver({shallow: true})) {
    lastDraggedProjectId = null;
    lastDropTargetProjectId = null;
    lastBefore = null;
    return;
  }
  if (
    lastDraggedProjectId === draggedProjectId &&
    dropTargetProjectId === lastDropTargetProjectId &&
    before === lastBefore
  ) {
    return;
  }
  lastDraggedProjectId = draggedProjectId;
  lastDropTargetProjectId = dropTargetProjectId;
  lastBefore = before;

  insert(draggedProject, before);
};

const projectDropCollect = (connect) => ({
  connectDropTarget: connect.dropTarget()
});

const projectDropSpec = {
  hover: handleProjectHover
};

export default createFragmentContainer(
  dragSource(PROJECT, projectDragSpec, projectDragCollect)(
    dropTarget(PROJECT, projectDropSpec, projectDropCollect)(DraggableProject)
  ),
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
