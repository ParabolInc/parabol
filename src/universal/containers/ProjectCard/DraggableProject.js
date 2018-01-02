// @flow
import type {Node} from 'react';
import type {Project, ProjectID} from 'universal/types/project';
import type {UserID} from 'universal/types/user';

import React, { Component } from 'react';
import {findDOMNode} from 'react-dom';
import {graphql} from 'react-relay';
import NullableProject from 'universal/components/NullableProject/NullableProject';
import withDragCache, {DragCache} from 'universal/dnd/withDragCache';
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

type Props = {
  area: string,
  connectDragSource: (node: Node) => Node,
  connectDragPreview: (node: Node) => Node,
  connectDropTarget: (node: Node) => Node,
  dragCache: DragCache,
  getProjectById: (ProjectID) => Project,
  insert: (project: Project, before: boolean) => void,
  isDragging: boolean,
  isPreview: boolean,
  myUserId: UserID,
  project: Project
};

class DraggableProject extends Component<Props> {
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

const projectDragSpec = {
  beginDrag(props) {
    return {projectId: props.project.id};
  },
  isDragging(props, monitor) {
    return props.project.id === monitor.getItem().projectId;
  }
};

const projectDragCollect = (connectSource, monitor) => ({
  connectDragSource: connectSource.dragSource(),
  connectDragPreview: connectSource.dragPreview(),
  isDragging: monitor.isDragging()
});

const handleProjectHover = (props: Props, monitor, component) => {
  const {dragCache, getProjectById, insert, project} = props;
  const dropTargetProjectId = project.id;
  const draggedProjectId = monitor.getItem().projectId;
  const draggedProject = getProjectById(draggedProjectId);

  if (!monitor.isOver({shallow: true})) {
    dragCache.clear();
    return;
  }

  if (draggedProjectId === dropTargetProjectId) {
    return;
  }

  // Compute whether I am dropping "before" or "after" the card.
  const {y: mouseY} = monitor.getClientOffset();
  const dropTargetDOMNode = findDOMNode(component); // eslint-disable-line react/no-find-dom-node
  if (!dropTargetDOMNode || dropTargetDOMNode instanceof Text) {
    return;
  }
  const {
    top: dropTargetTop,
    height: dropTargetHeight
  } = dropTargetDOMNode.getBoundingClientRect();
  const dropTargetMidpoint = dropTargetTop + (dropTargetHeight / 2);
  const before = mouseY < dropTargetMidpoint;

  if (dragCache.isSameDrag({draggedProjectId, before})) {
    return;
  }
  dragCache.update({draggedProjectId, before});

  insert(draggedProject, before);
};

const projectDropCollect = (connect) => ({
  connectDropTarget: connect.dropTarget()
});

const projectDropSpec = {
  hover: handleProjectHover
};

export default createFragmentContainer(
  withDragCache(
    dragSource(PROJECT, projectDragSpec, projectDragCollect)(
      dropTarget(PROJECT, projectDropSpec, projectDropCollect)(DraggableProject)
    )
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
