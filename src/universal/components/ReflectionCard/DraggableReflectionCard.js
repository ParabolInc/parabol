/**
 * A drag-and-drop enabled reflection card.
 *
 * @flow
 */
import React, {Component} from 'react';
import type {Props as ReflectionCardProps} from './ReflectionCard';
import ReflectionCard from './ReflectionCard';
import {createFragmentContainer} from 'react-relay';
import type {DraggableReflectionCard_reflection as Reflection} from './__generated__/DraggableReflectionCard_reflection.graphql';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {DragSource as dragSource} from 'react-dnd';
import {REFLECTION_CARD} from 'universal/utils/constants';
import styled from 'react-emotion';
import DragReflectionMutation from 'universal/mutations/DragReflectionMutation';
import Modal from 'redux-segment/examples/react-redux/src/components/ui/Modal';
import ReflectionCardInFlight from 'universal/components/ReflectionCardInFlight';

type Props = {
  dndIndex: number,
  reflection: Reflection,
  showOriginFooter: boolean,
  ...ReflectionCardProps,
};

const DragStyles = styled('div')(({isDragging}) => ({
  opacity: isDragging ? 0 : 1,
  margin: 8
}));

class DraggableReflectionCard extends Component<Props> {
  render() {
    const {
      connectDragSource,
      isCollapsed,
      isDragging,
      isOver,
      reflection,
      meeting,
      showOriginFooter
    } = this.props;
    return connectDragSource(
      <div>
        <DragStyles isDragging={isDragging} isOver={isOver}>
          <ReflectionCard isCollapsed={isCollapsed} meeting={meeting} reflection={reflection} showOriginFooter={showOriginFooter} />
        </DragStyles>
        <Modal isOpen={isDragging}>
          <ReflectionCardInFlight content={reflection.content}/>
        </Modal>
      </div>
    );
  }
}

const reflectionDragSpec = {
  beginDrag(props) {
    const {atmosphere, reflection: {reflectionId, reflectionGroupId}, currentRetroPhaseItemId, isSingleCardGroup} = props;
    DragReflectionMutation(atmosphere, {reflectionId, isDragging: true});
    return {
      reflectionId,
      reflectionGroupId,
      currentRetroPhaseItemId,
      isSingleCardGroup
    };
  },
  // isDragging(props, monitor) {
  //   return props.reflection.reflectionId === monitor.getItem().reflectionId;
  // },
  endDrag(props: Props) {
    const {atmosphere, reflection: {reflectionId}} = props;
    DragReflectionMutation(atmosphere, {reflectionId, isDragging: false});
  }
};

const reflectionDragCollect = (connectSource, monitor) => ({
  connectDragSource: connectSource.dragSource(),
  connectDragPreview: connectSource.dragPreview(),
  isDragging: monitor.isDragging()
});

export default createFragmentContainer(
  withAtmosphere(
    dragSource(REFLECTION_CARD, reflectionDragSpec, reflectionDragCollect)(
      DraggableReflectionCard
    )
  ),
  graphql`
    fragment DraggableReflectionCard_reflection on RetroReflection {
      content
      reflectionId: id
      reflectionGroupId
      retroPhaseItemId
      ...ReflectionCard_reflection
    }
  `
);
