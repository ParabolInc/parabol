// @flow
import type {Node} from 'react';
import type {Project} from 'universal/types/project';
import type {UserID} from 'universal/types/user';

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {findDOMNode} from 'react-dom';
import {graphql} from 'react-relay';
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

type Props = {
  area: string,
  connectDragSource: (node: Node) => Node,
  connectDragPreview: (node: Node) => Node,
  connectDropTarget: (node: Node) => Node,
  insert: (project: Project, before: boolean) => void,
  isDragging: boolean,
  isOver: boolean,
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

  componentWillReceiveProps(nextProps) {
    if (this.props.isOver && !nextProps.isOver) {
      clearDragCache();
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

const dragCache: Map<string, ?(string | boolean)> = new Map([
  ['draggedProjectId', null],
  ['dropTargetProjectId', null],
  ['before', null]
]);

const isSameDrag = (
  draggedProjectId: string,
  dropTargetProjectId: string,
  before: boolean
): boolean => (
  draggedProjectId === dragCache.get('draggedProjectId') &&
  dropTargetProjectId === dragCache.get('dropTargetProjectId') &&
  before === dragCache.get('before')
);

const updateDragCache = (
  draggedProjectId: string,
  dropTargetProjectId: string,
  before: boolean
): void => {
  dragCache
    .set('draggedProjectId', draggedProjectId)
    .set('dropTargetProjectId', dropTargetProjectId)
    .set('before', before);
};

const clearDragCache = (): void => {
  dragCache
    .set('draggedProjectId', null)
    .set('dropTargetProjectId', null)
    .set('before', null);
}

const handleProjectHover = (props, monitor, component) => {
  const {insert, project} = props;
  const dropTargetProjectId = project.id;
  const draggedProject = monitor.getItem();
  const draggedProjectId = draggedProject.id;

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

  // We're sort of memoizing here, since this hover function gets called
  // constantly during a drag operation; if the last dragged project and drop
  // target projects are the same with the same before/after relationship, then
  // we don't need to re-insert them.
  if (isSameDrag(draggedProjectId, dropTargetProjectId, before)) {
    return;
  }
  updateDragCache(draggedProjectId, dropTargetProjectId, before);

  insert(draggedProject, before);
};

const projectDropCollect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver({shallow: true})
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
