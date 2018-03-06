/**
 * A drag-and-drop enabled reflection card.
 *
 * @flow
 */
import type {Node} from 'react';
import type {Props as ReflectionCardProps} from './ReflectionCard';

import React from 'react';
import {DragSource} from 'react-dnd';
import {getEmptyImage} from 'react-dnd-html5-backend';

import {REFLECTION_CARD} from 'universal/utils/constants';
import without from 'universal/utils/without';

import ReflectionCard from './ReflectionCard';

type Props = {
  ...ReflectionCardProps,
  connectDragPreview: (Node) => Node,
  connectDragSource: (Node) => Node,
  handleBeginDrag: (draggedCardId: string) => any,
  handleEndDrag: (draggedCardId: string) => any,
  isDragging: boolean
};

const DraggableReflectionCard = (props: Props) => {
  const reflectionCardProps = without(props, 'connectDragSource');
  props.connectDragPreview(getEmptyImage());
  return props.connectDragSource(
    <div style={{display: 'inline-block'}}>
      <ReflectionCard {...reflectionCardProps} />
    </div>
  );
};

const cardSpec = {
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

const collect = (connect, monitor) => ({
  connectDragPreview: connect.dragPreview(),
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
});

export default DragSource(REFLECTION_CARD, cardSpec, collect)(DraggableReflectionCard);
