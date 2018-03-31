/**
 * Renders a column for a particular "type" of reflection
 * (e.g. positive or negative) during the Reflect phase of the retro meeting.
 *
 * @flow
 */
import type {PhaseItemColumn_meeting as Meeting} from './__generated__/PhaseItemColumn_meeting.graphql';
import type {PhaseItemColumn_retroPhaseItem as RetroPhaseItem} from './__generated__/PhaseItemColumn_retroPhaseItem.graphql';
// $FlowFixMe
import React, {Component} from 'react';
import styled from 'react-emotion';
import {createFragmentContainer} from 'react-relay';

import AddReflectionButton from 'universal/components/AddReflectionButton/AddReflectionButton';
import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard';
import AnonymousReflectionCard from 'universal/components/AnonymousReflectionCard/AnonymousReflectionCard';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import ui from 'universal/styles/ui';
import reactLifecyclesCompat from 'react-lifecycles-compat';
import {REFLECT, REFLECTION_GROUP, RETRO_PHASE_ITEM} from 'universal/utils/constants';
import ReflectionGroup from 'universal/components/ReflectionGroup/ReflectionGroup';
import type {DraggableLocation, DragStart, DroppableProvided, DroppableStateSnapshot, DropResult} from 'react-beautiful-dnd';
import {Draggable, Droppable} from 'react-beautiful-dnd';

const ColumnWrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  flex: 1
});

const ReflectionsArea = styled('div')({
  flexDirection: 'column',
  overflow: 'auto',
  height: '100%'
});

const TypeDescription = styled('div')({
  fontSize: '1.2rem',
  fontWeight: 'bold'
});

const TypeHeader = styled('div')({
  marginBottom: '2rem'
});

const TypeTitle = styled('div')({
  color: ui.labelHeadingColor
});

const ColumnChild = styled('div')({
  display: 'inline-block',
  margin: '0.7rem 0.7rem 0 0'
});

type Props = {
  atmosphere: Object,
  meeting: Meeting,
  retroPhaseItem: RetroPhaseItem
};

type State = {
  columnReflectionGroups: $ReadOnlyArray<Object>,
  reflectionGroups: $ReadOnlyArray<Object>
};

class PhaseItemColumn extends Component<Props, State> {
  static getDerivedStateFromProps(nextProps: Props, prevState: State): $Shape<State> | null {
    const {meeting: {reflectionGroups: nextReflectionGroups}, retroPhaseItem: {retroPhaseItemId}} = nextProps;
    if (nextReflectionGroups === prevState.reflectionGroups) return null;
    return {
      reflectionGroups: nextReflectionGroups || [],
      columnReflectionGroups: nextReflectionGroups
        .filter((group) => group.retroPhaseItemId === retroPhaseItemId && group.reflections.length > 0)
    };
  }

  state = {
    reflectionGroups: [],
    columnReflectionGroups: []
  };

  render() {
    const {dndIndex, meeting, retroPhaseItem} = this.props;
    const {columnReflectionGroups} = this.state;
    const {localPhase: {phaseType}} = meeting;
    const {retroPhaseItemId, title, question} = retroPhaseItem;
    return (
      <Droppable droppableId={retroPhaseItemId} type={RETRO_PHASE_ITEM}>
        {(dropProvided: DroppableProvided, dropSnapshot: DroppableStateSnapshot) => (
          <ColumnWrapper innerRef={dropProvided.innerRef}>
            <TypeHeader>
              <TypeTitle>{title.toUpperCase()}</TypeTitle>
              <TypeDescription>{question}</TypeDescription>
            </TypeHeader>
            <ReflectionsArea>
              {columnReflectionGroups.map((group, idx) => {
                if (phaseType === REFLECT) {
                  return group.reflections.map((reflection) => {
                    return (
                      <ColumnChild key={reflection.id}>
                        {reflection.isViewerCreator ?
                          <ReflectionCard meeting={meeting} reflection={reflection} /> :
                          <AnonymousReflectionCard meeting={meeting} reflection={reflection} />
                        }
                      </ColumnChild>
                    );
                  });
                }
                return (
                  <Draggable
                    key={group.id}
                    draggableId={group.id}
                    index={idx}
                    type={REFLECTION_GROUP}
                  >
                    {(dragProvided, dragSnapshot) => (
                      <div>
                        <ColumnChild
                          innerRef={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                        >
                          <ReflectionGroup reflectionGroup={group} meeting={meeting} />
                        </ColumnChild>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {phaseType === REFLECT &&
              <ColumnChild>
                <AddReflectionButton columnReflectionGroups={columnReflectionGroups} meeting={meeting} retroPhaseItem={retroPhaseItem} />
              </ColumnChild>
              }
            </ReflectionsArea>
          </ColumnWrapper>
        )}
      </Droppable>
    )
  }
}

reactLifecyclesCompat(PhaseItemColumn);

export default createFragmentContainer(
  withAtmosphere(PhaseItemColumn),
  graphql`
    fragment PhaseItemColumn_retroPhaseItem on RetroPhaseItem {
      ...AddReflectionButton_retroPhaseItem
      retroPhaseItemId: id
      title
      question
    }

    fragment PhaseItemColumn_meeting on RetrospectiveMeeting {
      ...AddReflectionButton_meeting
      ...AnonymousReflectionCard_meeting
      ...ReflectionCard_meeting
      ...ReflectionGroup_meeting
      meetingId: id
      localPhase {
        phaseType
      }
      reflectionGroups {
        id
        ...ReflectionGroup_reflectionGroup
        retroPhaseItemId
        sortOrder
        reflections {
          ...AnonymousReflectionCard_reflection
          ...ReflectionCard_reflection
          content
          id
          isEditing
          isViewerCreator
          sortOrder
        }
      }
    }
  `
);
