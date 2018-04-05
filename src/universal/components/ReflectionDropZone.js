import React from 'react';
import {REFLECTION_CARD} from 'universal/utils/constants';
import {Droppable} from 'react-beautiful-dnd';
import type {DroppableProvided, DroppableStateSnapshot} from 'react-beautiful-dnd/src/index';
import styled from 'react-emotion';
import {createFragmentContainer} from 'react-relay';
import {ReflectionDropZone_retroPhaseItem as RetroPhaseItem} from './__generated__/ReflectionDropZone_retroPhaseItem.graphql';

type Props = {
  retroPhaseItem: RetroPhaseItem
};

const DropZoneStyles = styled('div')(({isDraggingOver}) => ({
  background: isDraggingOver && 'blue',
  flex: 1,
  height: '100%'
}));

const ReflectionDropZone = (props: Props) => {
  const {retroPhaseItem} = props;
  const {isDropZoneEnabled, retroPhaseItemId} = retroPhaseItem;
  return (
    <Droppable
      droppableId={retroPhaseItemId}
      type={REFLECTION_CARD}
      isDropDisabled={!isDropZoneEnabled}
    >
      {(dropProvided: DroppableProvided, dropSnapshot: DroppableStateSnapshot) => (
        <DropZoneStyles
          innerRef={dropProvided.innerRef}
          isDraggingOver={dropSnapshot.isDraggingOver}
          {...dropProvided.droppableProps}
        />
      )}
    </Droppable>
  );
};

export default createFragmentContainer(
  ReflectionDropZone,
  graphql`
    fragment ReflectionDropZone_retroPhaseItem on RetroPhaseItem {
      retroPhaseItemId: id
      isDropZoneEnabled
    }
  `
);
