// @flow
import type {Node} from 'react';
import type {Task, TaskID, Status} from 'universal/types/task';

import React from 'react';
import {DropTarget} from 'react-dnd';

import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import sortOrderBetween from 'universal/dnd/sortOrderBetween';
import UpdateTaskMutation from 'universal/mutations/UpdateTaskMutation';
import {PROJECT} from 'universal/utils/constants';

type Props = {
  connectDropTarget: (node: Node) => Node,
  area: string,
  atmosphere: Object, // TODO: atmosphere needs a type definition
  getTaskById: (TaskID) => Task,
  lastTask: ?Task, // the last task in a column; may be undefined if the column is empty
  status: Status
};

type UpdateTaskMutationArgs = {
  id: TaskID,
  sortOrder: number,
  status?: Status
};

// Represents the trailing space at the end of a column.  Acts as a drop target
// for cards being dragged over a column rather than cards in that column.
const TaskColumnDropZone = (props: Props) => (
  props.connectDropTarget(
    <div style={{height: '100%'}} />
  )
);

const spec = {
  hover: (props: Props, monitor) => {
    const {
      area,
      atmosphere,
      getTaskById,
      lastTask,
      status
    } = props;
    const draggedTaskId = monitor.getItem().taskId;
    const draggedTask = getTaskById(draggedTaskId);

    if (!monitor.isOver({shallow: true})) {
      return;
    }
    if (lastTask && draggedTask.id === lastTask.id) {
      return;
    }

    const sortOrder = sortOrderBetween(lastTask, null, draggedTask, false);

    const updatedTask: UpdateTaskMutationArgs = {
      id: draggedTask.id,
      sortOrder
    };
    if (draggedTask.status !== status) {
      updatedTask.status = status;
    }
    UpdateTaskMutation(atmosphere, updatedTask, area);
  }
};

const collect = (connect) => ({
  connectDropTarget: connect.dropTarget()
});

export default withAtmosphere(
  DropTarget(PROJECT, spec, collect)(
    TaskColumnDropZone
  )
);
