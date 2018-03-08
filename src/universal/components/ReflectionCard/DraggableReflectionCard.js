/**
 * A drag-and-drop enabled reflection card.
 *
 * @flow
 */
import type {Node} from 'react';
import type {Props as ReflectionCardProps} from './ReflectionCard';

import React from 'react';
import {DragSource, DropTarget} from 'react-dnd';
import {getEmptyImage} from 'react-dnd-html5-backend';

import compose from 'universal/utils/compose';
import {REFLECTION_CARD} from 'universal/utils/constants';
import without from 'universal/utils/without';

import ReflectionCard from './ReflectionCard';

type Props = {
  ...ReflectionCardProps,
  connectDragPreview: (Node) => Node,
  connectDragSource: (Node) => Node,
  connectDropTarget: (Node) => Node,
  handleBeginDrag: (draggedCardId: string) => any,
  handleEndDrag: (draggedCardId: string) => any,
  isDragging: boolean,
  hovered: boolean
};

const DraggableReflectionCard = (props: Props) => {
  const reflectionCardProps = without(props, 'connectDragSource');
  props.connectDragPreview(getEmptyImage());
  const connect = compose(props.connectDragSource, props.connectDropTarget);
  return connect(
    <div style={{display: 'inline-block'}}>
      <ReflectionCard {...reflectionCardProps} />
    </div>
  );
};

const dragSpec = {
  beginDrag(props: Props) {
    const {handleBeginDrag, id} = props;
    handleBeginDrag(id);
    return {id};
  },

  endDrag(props: Props) {
    const {handleEndDrag, id} = props;
    handleEndDrag(id);
  }
};

const dragCollect = (connect, monitor) => ({
  connectDragPreview: connect.dragPreview(),
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
});

const dropSpec = {
  // Makes the id of the card-dropped-into available in the dragSpec's endDrag method.
  drop(props: Props) {
    return {id: props.id};
  }
};

const dropCollect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  hovered: monitor.isOver()
});

export default compose(
  DragSource(REFLECTION_CARD, dragSpec, dragCollect),
  DropTarget(REFLECTION_CARD, dropSpec, dropCollect)
)(DraggableReflectionCard);
