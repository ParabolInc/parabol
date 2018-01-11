// @flow
import type {Node} from 'react';
import type {UpdateProjectMutationVariables} from 'universal/mutations/UpdateProjectMutation';
import type {Area} from 'universal/types/area';
import type {Project, ProjectID, Status} from 'universal/types/project';

import React from 'react';
import {DropTarget} from 'react-dnd';

import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import sortOrderBetween from 'universal/dnd/sortOrderBetween';
import UpdateProjectMutation from 'universal/mutations/UpdateProjectMutation';
import {PROJECT} from 'universal/utils/constants';

type Props = {
  connectDropTarget: (node: Node) => Node,
  area: Area,
  atmosphere: Object, // TODO: atmosphere needs a type definition
  getProjectById: (ProjectID) => ?Project,
  lastProject: ?Project, // the last project in a column; may be undefined if the column is empty
  status: Status
};

// Represents the trailing space at the end of a column.  Acts as a drop target
// for cards being dragged over a column rather than cards in that column.
const ProjectColumnDropZone = (props: Props) => (
  props.connectDropTarget(
    <div style={{height: '100%'}} />
  )
);

const spec = {
  hover: (props: Props, monitor) => {
    const {
      area,
      atmosphere,
      getProjectById,
      lastProject,
      status
    } = props;
    const draggedProjectId = monitor.getItem().projectId;
    const draggedProject = getProjectById(draggedProjectId);

    if (!draggedProject) {
      return;
    }
    if (!monitor.isOver({shallow: true})) {
      return;
    }
    if (lastProject && draggedProject.id === lastProject.id) {
      return;
    }

    const sortOrder = sortOrderBetween(lastProject, null, draggedProject, false);

    const variables: UpdateProjectMutationVariables = {
      updatedProject: {
        id: draggedProject.id,
        sortOrder
      },
      area
    };
    if (draggedProject.status !== status) {
      variables.updatedProject.status = status;
    }
    UpdateProjectMutation(atmosphere, variables);
  }
};

const collect = (connect) => ({
  connectDropTarget: connect.dropTarget()
});

export default withAtmosphere(
  DropTarget(PROJECT, spec, collect)(
    ProjectColumnDropZone
  )
);
