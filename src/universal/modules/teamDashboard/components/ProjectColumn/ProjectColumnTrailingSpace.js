// @flow
import type {Node} from 'react';
import type {Project} from 'universal/types/project';

import React from 'react';
import {DropTarget} from 'react-dnd';

import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import sortOrderBetween from 'universal/dnd/sortOrderBetween';
import UpdateProjectMutation from 'universal/mutations/UpdateProjectMutation';
import {PROJECT} from 'universal/utils/constants';

type Props = {
  connectDropTarget: (node: Node) => Node,
  area: string,
  atmosphere: Object, // TODO: atmosphere needs a type definition
  lastProject: Project,
  status: string
};

let previousLastProjectId = null;
let previousDraggedProjectId = null;
const spec = {
  hover: (props: Props, monitor) => {
    const {area, atmosphere, lastProject, status} = props;
    const draggedProject = monitor.getItem();

    if (!monitor.isOver({shallow: true})) {
      previousLastProjectId = null;
      previousDraggedProjectId = null;
      return;
    }
    if (
      draggedProject.id === previousDraggedProjectId &&
      (lastProject && lastProject.id) === previousLastProjectId
    ) {
      return;
    }
    previousDraggedProjectId = draggedProject.id;
    previousLastProjectId = lastProject && lastProject.id;

    const sortOrder = sortOrderBetween(lastProject, null, draggedProject, false);

    const noActionNeeded = sortOrder === draggedProject.sortOrder && draggedProject.status === status;
    if (noActionNeeded) {
      return;
    }

    const updatedProject = {
      id: draggedProject.id,
      status,
      sortOrder
    };
    UpdateProjectMutation(atmosphere, updatedProject, area);
  }
};

const collect = (connect) => ({
  connectDropTarget: connect.dropTarget()
});

const ProjectColumnTrailingSpace = ({connectDropTarget}: Props) => (
  connectDropTarget(<div style={{height: '100%'}} />)
);

export default withAtmosphere(
  DropTarget(PROJECT, spec, collect)(
    ProjectColumnTrailingSpace
  )
);
