/**
 * A drag-and-drop enabled reflection card.
 *
 * @flow
 */
import React from 'react';
import type {Props as ReflectionCardProps} from './ReflectionCard';
import ReflectionCard from './ReflectionCard';
import {REFLECTION_CARD} from 'universal/utils/constants';
import {createFragmentContainer} from 'react-relay';
import type {DraggableReflectionCard_reflection as Reflection} from './__generated__/DraggableReflectionCard_reflection.graphql';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {Draggable} from 'react-beautiful-dnd';

type Props = {
  dndIndex: number,
  reflection: Reflection,
  showOriginFooter: boolean,
  ...ReflectionCardProps,
};

const DraggableReflectionCard = (props: Props) => {
  const {
    dndIndex,
    isCollapsed,
    isExpanded,
    reflection,
    meeting,
    showOriginFooter
  } = props;
  const {reflectionId} = reflection;
  return (
    <div>
      <Draggable
        draggableId={reflectionId}
        type={REFLECTION_CARD}
        index={dndIndex}
        isDragDisabled={isCollapsed}
      >
        {(dragProvided, dragSnapshot) => {
          return (
            <div ref={isExpanded ? undefined : dragProvided.transformRef}>
              <div
                ref={dragProvided.innerRef}
                {...dragProvided.draggableProps}
                {...dragProvided.dragHandleProps}
                style={{
                  ...dragProvided.draggableProps.style,
                  marginBottom: 8,
                }}
              >
                <ReflectionCard isCollapsed={isCollapsed} meeting={meeting} reflection={reflection} showOriginFooter={showOriginFooter} />
              </div>
              {dragProvided.placeholder}
            </div>
          )
        }}
      </Draggable>
    </div>
  );
}

export default createFragmentContainer(
  withAtmosphere(DraggableReflectionCard),
  graphql`
    fragment DraggableReflectionCard_reflection on RetroReflection {
      reflectionId: id
      ...ReflectionCard_reflection
    }
  `
);
