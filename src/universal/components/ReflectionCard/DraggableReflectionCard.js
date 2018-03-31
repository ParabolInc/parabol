/**
 * A drag-and-drop enabled reflection card.
 *
 * @flow
 */
import type {Node} from 'react';
import React, {Component} from 'react';
import type {Props as ReflectionCardProps} from './ReflectionCard';
import ReflectionCard from './ReflectionCard';
import type {ReflectionID} from 'universal/types/retro';
import {DragSource, DropTarget} from 'react-dnd';
import {REFLECTION_CARD} from 'universal/utils/constants';
import {createFragmentContainer} from 'react-relay';
import styled from 'react-emotion';
import type {DraggableReflectionCard_reflection as Reflection} from './__generated__/DraggableReflectionCard_reflection.graphql';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';

type DragItem = {
  reflection: Reflection
};

type Props = {
  ...ReflectionCardProps,
  receiveDrops: ?boolean,
  canDrop: boolean,
  connectDragPreview: (Node) => Node,
  connectDragSource: (Node) => Node,
  connectDropTarget: (Node) => Node,
  handleCancelDrag: (draggedCardId: ReflectionID) => any,
  handleBeginDrag: (draggedCardId: ReflectionID) => any,
  handleDrop: (draggedCardId: ReflectionID, droppedCardId: ReflectionID) => any,
  isDragging: boolean,
  isOver: boolean,
  reflection: Reflection
};

const DragStyles = styled('div')(({isOver, canDrop}) => ({
  backgroundColor: isOver && canDrop ? '#f8f7fa' : '#FFF'
  // display: 'inline-block'
}));

class DraggableReflectionCard extends Component<Props> {
  render() {
    const {
      canDrop,
      // connectDragPreview,
      connectDragSource,
      connectDropTarget,
      isOver,
      reflection,
      meeting
    } = this.props;
    const hovered = isOver && canDrop;
    return connectDragSource(connectDropTarget(
      <div>
        <DragStyles isOver={isOver} canDrop={canDrop}>
          <ReflectionCard hovered={hovered} meeting={meeting} reflection={reflection} />
        </DragStyles>
      </div>
      // isOver && canDrop ? (
      //   <div style={{display: 'inline-block'}}>
      //     <ReflectionGroup
      //       id={newId()}
      //       reflections={[
      //         {id, content: contentState}
      //       ]}
      //       hovered
      //     />
      //   </div>
      // ) : (
      //   <div style={{display: 'inline-block'}}>
      //     <ReflectionCard {...reflectionCardProps} />
      //   </div>
      // )
      )
    );
  }
}

const dragSpec = {
  beginDrag(props: Props): DragItem {
    console.log('beginDrag');
    const {handleBeginDrag, reflection} = props;
    handleBeginDrag(reflection);
    return {reflection};
  },

  endDrag(props: Props, monitor) {
    if (!monitor.didDrop()) {
      props.handleCancelDrag(props.reflection.id);
    }
  }
};

const dragCollect = (connect, monitor) => ({
  connectDragPreview: connect.dragPreview(),
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
});

const dropSpec = {
  canDrop(props: Props, monitor) {
    return monitor.isOver() && props.reflection.id !== monitor.getItem().reflection.id;
  },

  // Makes the card-dropped-into available in the dragSpec's endDrag method.
  drop(props: Props, monitor) {
    // if (monitor.didDrop()) {
    //   return;
    // }
    const {reflection: {id: draggedId}} = monitor.getItem();
    const {atmosphere, reflection: {id: droppedId}} = props;
    // UpdateReflection
    // handleDrop(draggedId, droppedId);
  }
};

const dropCollect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver({shallow: true}),
  item: monitor.getItem(),
  canDrop: monitor.canDrop()
});

export default createFragmentContainer(
  withAtmosphere(
    DragSource(REFLECTION_CARD, dragSpec, dragCollect)(
      DropTarget(REFLECTION_CARD, dropSpec, dropCollect)(
        DraggableReflectionCard
      )
    )
  )
  ,
  graphql`
    fragment DraggableReflectionCard_reflection on RetroReflection {
      id
      ...ReflectionCard_reflection
    }
  `
);
