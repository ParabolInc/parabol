// @flow
import type {Node} from 'react';
import type {Project} from 'universal/types/project';

import React, {Component} from 'react';
import {DropTarget} from 'react-dnd';

import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import sortOrderBetween from 'universal/dnd/sortOrderBetween';
import UpdateProjectMutation from 'universal/mutations/UpdateProjectMutation';
import {PROJECT} from 'universal/utils/constants';

// A singleton for memoizing drag operations over columns.  Works on the
// assumption that you can only ever drag one card at a time.
const dragCache: Map<string, ?string> = new Map([
  ['draggedProjectId', null],
  ['columnStatus', null]
]);

const isSameDrag = (draggedProjectId: string, columnStatus: string): boolean => (
  draggedProjectId === dragCache.get('draggedProjectId') &&
  columnStatus === dragCache.get('columnStatus')
);

const updateDragCache = (draggedProjectId: string, columnStatus: string): void => {
  dragCache
    .set('draggedProjectId', draggedProjectId)
    .set('columnStatus', columnStatus);
};

const clearDragCache = (): void => {
  dragCache
    .set('columnStatus', null)
    .set('draggedProjectId', null);
};

type Props = {
  connectDropTarget: (node: Node) => Node,
  area: string,
  atmosphere: Object, // TODO: atmosphere needs a type definition
  isOver: boolean,
  lastProject: ?Project, // the last project in a column; may be undefined if the column is empty
  status: string
};

// Represents the trailing space at the end of a column.  Acts as a drop target
// for cards being dragged over a column rather than cards in that column.
class ProjectColumnDropZone extends Component<Props> {
  componentWillReceiveProps(nextProps) {
    if (this.props.isOver && !nextProps.isOver) {
      clearDragCache();
    }
  }

  render() {
    return this.props.connectDropTarget(
      <div style={{height: '100%'}} />
    );
  }
}

const spec = {
  hover: (props: Props, monitor) => {
    const {area, atmosphere, lastProject, status} = props;
    const draggedProject = monitor.getItem();

    if (isSameDrag(draggedProject.id, status)) {
      return;
    }
    updateDragCache(draggedProject.id, status);

    const sortOrder = sortOrderBetween(lastProject, null, draggedProject, false);

    const updatedProject = {
      id: draggedProject.id,
      status,
      sortOrder
    };
    UpdateProjectMutation(atmosphere, updatedProject, area);
  }
};

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver({shallow: true})
});

export default withAtmosphere(
  DropTarget(PROJECT, spec, collect)(
    ProjectColumnDropZone
  )
);
