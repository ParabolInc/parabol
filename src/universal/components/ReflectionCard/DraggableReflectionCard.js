/**
 * A drag-and-drop enabled reflection card.
 *
 * @flow
 */
import type {Node} from 'react';
import type {Props as ReflectionCardProps} from './ReflectionCard';
import type {ReflectionID} from 'universal/types/retro';

import React, {Component} from 'react';
import {findDOMNode} from 'react-dom';
import {DragSource, DropTarget} from 'react-dnd';
import {getEmptyImage} from 'react-dnd-html5-backend';

import compose from 'universal/utils/compose';
import {REFLECTION_CARD} from 'universal/utils/constants';
import without from 'universal/utils/without';

import ReflectionCard from './ReflectionCard';
import ReflectionGroup from 'universal/components/ReflectionGroup/ReflectionGroup';

type DragItem = {
  id: ReflectionID,
  height: number
};

type Props = {
  ...ReflectionCardProps,
  canDrop: boolean,
  connectDragPreview: (Node) => Node,
  connectDragSource: (Node) => Node,
  connectDropTarget: (Node) => Node,
  handleCancelDrag: (draggedCardId: ReflectionID) => any,
  handleBeginDrag: (draggedCardId: ReflectionID) => any,
  handleDrop: (draggedCardId: ReflectionID, droppedCardId: ReflectionID) => any,
  isDragging: boolean,
  isOver: boolean,
  item: ?DragItem
};

class DraggableReflectionCard extends Component<Props> {
  render() {
    const {
      canDrop,
      connectDragPreview,
      connectDragSource,
      connectDropTarget,
      contentState,
      id,
      isOver,
      item,
      stage
    } = this.props;
    const reflectionCardProps = {
      ...without(this.props, 'connectDragSource'),
      hovered: isOver && canDrop
    };
    connectDragPreview(getEmptyImage());
    const connect = compose(connectDragSource, connectDropTarget);
    if (item) {
      console.log('item height:', item.height);
    }
    return connect(
      isOver && canDrop ? (
        <div style={{display: 'inline-block'}}>
          <ReflectionGroup
            reflections={[
              {id, content: contentState, stage}
            ]}
            hoveredHeight={item ? item.height : 0}
          />
        </div>
      ) : (
        <div style={{display: 'inline-block'}}>
          <ReflectionCard {...reflectionCardProps} />
        </div>
      )
    );
  }
}

const dragSpec = {
  beginDrag(props: Props, monitor, component): DragItem {
    const {handleBeginDrag, id} = props;
    const domNode = findDOMNode(component); // eslint-disable-line react/no-find-dom-node
    const height = domNode instanceof Element ? domNode.clientHeight : 0;
    handleBeginDrag(id);
    return {id, height};
  },

  endDrag(props: Props, monitor) {
    if (!monitor.didDrop()) {
      props.handleCancelDrag(props.id);
      return;
    }
    const {id: droppedId} = monitor.getDropResult();
    const {handleDrop, id: draggedId} = props;
    handleDrop(draggedId, droppedId);
  }
};

const dragCollect = (connect, monitor) => ({
  connectDragPreview: connect.dragPreview(),
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
});

const dropSpec = {
  canDrop(props: Props, monitor) {
    return props.id !== monitor.getItem().id;
  },

  // Makes the id of the card-dropped-into available in the dragSpec's endDrag method.
  drop(props: Props) {
    return {id: props.id};
  }
};

const dropCollect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver({shallow: true}),
  item: monitor.getItem(),
  canDrop: monitor.canDrop()
});

export default compose(
  DragSource(REFLECTION_CARD, dragSpec, dragCollect),
  DropTarget(REFLECTION_CARD, dropSpec, dropCollect)
)(DraggableReflectionCard);
