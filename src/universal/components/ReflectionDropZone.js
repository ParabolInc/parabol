import React from 'react';
import {REFLECTION_CARD} from 'universal/utils/constants';
import {Droppable} from 'react-beautiful-dnd';
import type {DroppableProvided, DroppableStateSnapshot} from 'react-beautiful-dnd/src/index';
import styled from 'react-emotion';

type Props = {
  retroPhaseItemId: string
};

const DropZoneStyles = styled('div')(({isDraggingOver}) => ({
  background: isDraggingOver && 'blue',
  flex: 1,
  height: '100%'
}));

const ReflectionDropZone = (props: Props) => {
  const {retroPhaseItemId} = props;
  return (
      <Droppable
        droppableId={retroPhaseItemId}
        type={REFLECTION_CARD}
      >
        {(dropProvided: DroppableProvided, dropSnapshot: DroppableStateSnapshot) => (
          <DropZoneStyles
            innerRef={dropProvided.innerRef}
            isDraggingOver={dropSnapshot.isDraggingOver}
            {...dropProvided.droppableProps}
          >
          </DropZoneStyles>
        )}
      </Droppable>
  );
};

export default ReflectionDropZone;
