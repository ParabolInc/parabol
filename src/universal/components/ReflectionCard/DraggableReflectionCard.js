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
import {REFLECTION_CARD} from 'universal/utils/constants';
import {createFragmentContainer} from 'react-relay';
import styled from 'react-emotion';
import type {DraggableReflectionCard_reflection as Reflection} from './__generated__/DraggableReflectionCard_reflection.graphql';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {Draggable} from 'react-beautiful-dnd';

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
  reflection: Reflection,
  showOriginFooter: boolean
};

const DragStyles = styled('div')(({isDraggingOver}) => ({
  backgroundColor: isDraggingOver && '#f8f7fa'
  // display: 'inline-block'
}));

class DraggableReflectionCard extends Component<Props> {
  render() {
    const {
      dndIndex,
      reflection,
      meeting,
      showOriginFooter
    } = this.props;
    const {reflectionId} = reflection;
    return (
      <Draggable
        draggableId={reflectionId}
        type={REFLECTION_CARD}
        index={dndIndex}
      >
        {(dragProvided, dragSnapshot) => (
          <React.Fragment>
            <DragStyles
              isDraggingOver={dragSnapshot.isDraggingOver}
              innerRef={dragProvided.innerRef}
              {...dragProvided.draggableProps}
              {...dragProvided.dragHandleProps}
            >
              <ReflectionCard meeting={meeting} reflection={reflection} showOriginFooter={showOriginFooter} />
            </DragStyles>
            {dragProvided.placeholder}
          </React.Fragment>
        )}
      </Draggable>
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
    );
  }
}

// const dragSpec = {
//   beginDrag(props: Props): DragItem {
//     console.log('beginDrag');
//     const {handleBeginDrag, reflection} = props;
//     handleBeginDrag(reflection);
//     return {reflection};
//   },
//
//   endDrag(props: Props, monitor) {
//     if (!monitor.didDrop()) {
//       props.handleCancelDrag(props.reflection.id);
//     }
//   }
// };
//
// const dragCollect = (connect, monitor) => ({
//   connectDragPreview: connect.dragPreview(),
//   connectDragSource: connect.dragSource(),
//   isDragging: monitor.isDragging()
// });
//
// const dropSpec = {
//   canDrop(props: Props, monitor) {
//     return monitor.isOver() && props.reflection.id !== monitor.getItem().reflection.id;
//   },
//
//   // Makes the card-dropped-into available in the dragSpec's endDrag method.
//   drop(props: Props, monitor) {
//     // if (monitor.didDrop()) {
//     //   return;
//     // }
//     const {reflection: {id: draggedId}} = monitor.getItem();
//     const {atmosphere, reflection: {id: droppedId}} = props;
//     // UpdateReflection
//     // handleDrop(draggedId, droppedId);
//   }
// };
//
// const dropCollect = (connect, monitor) => ({
//   connectDropTarget: connect.dropTarget(),
//   isOver: monitor.isOver({shallow: true}),
//   item: monitor.getItem(),
//   canDrop: monitor.canDrop()
// });

export default createFragmentContainer(
  withAtmosphere(DraggableReflectionCard),
  graphql`
    fragment DraggableReflectionCard_reflection on RetroReflection {
      reflectionId: id
      ...ReflectionCard_reflection
    }
  `
);
