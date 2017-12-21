// @flow
import type {Node} from 'react';
import React from 'react';
import {DropTarget} from 'react-dnd';
import {PROJECT} from 'universal/utils/constants';

type Props = {
  connectDropTarget: (node: Node) => Node,
  area: string,
  atmosphere: Object, // TODO: atmosphere needs a type definition
  insert: Function,
  status: string
};

const spec = {
  hover: (props: Props, monitor) => {
    const {insertProject} = props;
    const draggedProject = monitor.getItem();
    insertProject(draggedProject.id);
  }
};

const collect = (connect) => ({
  connectDropTarget: connect.dropTarget()
});

const ProjectColumnTrailingSpace = ({connectDropTarget}: Props) => (
  connectDropTarget(<div style={{height: '100%'}} />)
);

export default DropTarget(PROJECT, spec, collect)(
  ProjectColumnTrailingSpace
);
