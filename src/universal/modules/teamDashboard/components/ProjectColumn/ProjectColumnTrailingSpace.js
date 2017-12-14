// @flow
import type {Node} from 'react';
import type {Project} from 'universal/types/project';

import {cashay} from 'cashay';
import React from 'react';
import {DropTarget} from 'react-dnd';

import sortOrderBetween from 'universal/dnd/sortOrderBetween';
import {MEETING, PROJECT, TEAM_DASH, USER_DASH} from 'universal/utils/constants';

const areaOpLookup = {
  [MEETING]: 'meetingUpdatesContainer',
  [USER_DASH]: 'userColumnsContainer',
  [TEAM_DASH]: 'teamColumnsContainer'
};

type Props = {
  connectDropTarget: (node: Node) => Node,
  area: string,
  lastProject: Project,
  status: string,
  queryKey: string
};

let previousLastProjectId = null;
let previousDraggedProjectId = null;
const spec = {
  hover: (props: Props, monitor) => {
    const {area, lastProject, status, queryKey} = props;
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

    const gqlArgs = {
      area,
      updatedProject: {id: draggedProject.id, status, sortOrder}
    };
    const op = areaOpLookup[area];
    const cashayArgs = {
      ops: {[op]: queryKey},
      variables: gqlArgs
    };
    cashay.mutate('updateProject', cashayArgs);
  }
};

const collect = (connect) => ({
  connectDropTarget: connect.dropTarget()
});

const ProjectColumnTrailingSpace = ({connectDropTarget}: Props) => (
  connectDropTarget(<div style={{height: '100%'}} />)
);

export default DropTarget(PROJECT, spec, collect)(ProjectColumnTrailingSpace);
