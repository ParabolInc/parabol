/**
 * The reflection group as a drop target
 *
 * @flow
 */
import type {Node} from 'react';
import type {ReflectionID, ReflectionGroupID} from 'universal/types/retro';
import type {Props as ReflectionGroupProps} from './ReflectionGroup';

import React from 'react';
import {DropTarget} from 'react-dnd';

import {REFLECTION_CARD} from 'universal/utils/constants';
import without from 'universal/utils/without';

import ReflectionGroup from './ReflectionGroup';

type Props = {
  ...ReflectionGroupProps,
  connectDropTarget: (Node) => Node,
  id: ReflectionGroupID,
  handleDrop: (reflectionId: ReflectionID, reflectionGroupId: ReflectionGroupID) => any
};

const DroppableReflectionGroup = (props: Props) => {
  const {connectDropTarget} = props;
  const reflectionGroupProps = without(props, 'connectDropTarget', 'handleDrop');
  return connectDropTarget(
    <div>
      <ReflectionGroup {...reflectionGroupProps} />
    </div>
  );
};

const spec = {
  // Cannot drop if the reflection is already a member of this group
  canDrop(props: Props, monitor) {
    const {id: reflectionId} = monitor.getItem();
    const {reflections} = props;
    return !reflections || !reflections.find((reflection) => reflection.id === reflectionId);
  },

  drop(props: Props, monitor) {
    if (monitor.didDrop()) {
      return;
    }
    const {handleDrop, id: reflectionGroupId} = props;
    const {id: reflectionId} = monitor.getItem();
    handleDrop(reflectionId, reflectionGroupId);
  }
};

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  hovered: monitor.isOver() && monitor.canDrop()
});

export default DropTarget(REFLECTION_CARD, spec, collect)(DroppableReflectionGroup);
