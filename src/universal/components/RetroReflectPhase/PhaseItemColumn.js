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

import AddReflectionButton from 'universal/components/AddReflectionButton/AddReflectionButton';
import ui from 'universal/styles/ui';
import {GROUP, REFLECT, REFLECTION_CARD, VOTE} from 'universal/utils/constants';
import ReflectionGroup from 'universal/components/ReflectionGroup/ReflectionGroup';
import type {DroppableProvided, DroppableStateSnapshot} from 'react-beautiful-dnd/src/index';

import {Droppable} from 'react-beautiful-dnd';
import {createFragmentContainer} from 'react-relay';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import reactLifecyclesCompat from 'react-lifecycles-compat';
import ReflectionDropZone from 'universal/components/ReflectionDropZone';
import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard';
import AnonymousReflectionCard from 'universal/components/AnonymousReflectionCard/AnonymousReflectionCard';
import findMeetingStage from 'universal/utils/meetings/findMeetingStage';

import {LabelHeading} from 'universal/components';

const ColumnWrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  flex: 1
});

const ReflectionsArea = styled('div')({
  flexDirection: 'column',
  display: 'flex',
  // cannot use overflow since react-beautiful-dnd does not use portals.
  // overflow: 'auto',
  height: '100%',
  minWidth: ui.retroCardWidth
});

const ReflectionsList = styled('div')({
  // adds a buffer to the dropzone to limit unwanted drags to the dropzone
  marginBottom: '1rem'
});


const TypeDescription = styled('div')({
  fontSize: '1.25rem',
  fontStyle: 'italic',
  fontWeight: 600
});

const TypeHeader = styled('div')({
  marginBottom: '1rem'
});

const ColumnChild = styled('div')(
  ({isDraggingOver}) => ({
    // background: isDraggingOver && 'blue',
    opacity: isDraggingOver && 0.6,
    margin: 8
  })
);

const EntireDropZone = styled('div')({
  flex: 1,
  minWidth: '100%'
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
    const reflectionGroups = nextReflectionGroups || [];
    return {
      reflectionGroups,
      columnReflectionGroups: reflectionGroups
        .filter((group) => group.retroPhaseItemId === retroPhaseItemId && group.reflections.length > 0)
    };
  }

  state = {
    reflectionGroups: [],
    columnReflectionGroups: []
  };

  render() {
    const {meeting, retroPhaseItem} = this.props;
    const {columnReflectionGroups} = this.state;
    const {localPhase: {phaseType}, phases} = meeting;
    const {retroPhaseItemId, title, question} = retroPhaseItem;
    const meetingStageRes = findMeetingStage(phases);
    if (!meetingStageRes) return null;
    const {phase: {phaseType: meetingPhaseType}} = meetingStageRes;
    return (
      <ColumnWrapper>
        <TypeHeader>
          <LabelHeading>{title.toUpperCase()}</LabelHeading>
          <TypeDescription>{question}</TypeDescription>
        </TypeHeader>
        <ReflectionsArea>
          <ReflectionsList>
            {columnReflectionGroups.map((group) => {
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
              } else if (phaseType === GROUP) {
                return (
                  <Droppable
                    key={group.id}
                    droppableId={group.id}
                    type={REFLECTION_CARD}
                  >
                    {(dropProvided: DroppableProvided, dropSnapshot: DroppableStateSnapshot) => (
                      <ColumnChild
                        innerRef={dropProvided.innerRef}
                        isDraggingOver={dropSnapshot.isDraggingOver}
                        {...dropProvided.droppableProps}
                      >
                        <ReflectionGroup
                          reflectionGroup={group}
                          retroPhaseItemId={retroPhaseItemId}
                          meeting={meeting}
                          isDraggingOver={dropSnapshot.isDraggingOver}
                        />
                        {dropProvided.placeholder}
                      </ColumnChild>
                    )}
                  </Droppable>
                );
              } else if (phaseType === VOTE) {
                return (
                  <ColumnChild key={group.id}>
                    <ReflectionGroup
                      reflectionGroup={group}
                      retroPhaseItemId={retroPhaseItemId}
                      meeting={meeting}
                    />
                  </ColumnChild>
                );
              }
              return null;
            })}
          </ReflectionsList>
          {phaseType === GROUP && meetingPhaseType === GROUP &&
          <EntireDropZone>
            <ReflectionDropZone retroPhaseItem={retroPhaseItem} />
          </EntireDropZone>
          }
          {phaseType === REFLECT && meetingPhaseType === REFLECT &&
          <ColumnChild>
            <AddReflectionButton columnReflectionGroups={columnReflectionGroups} meeting={meeting} retroPhaseItem={retroPhaseItem} />
          </ColumnChild>
          }
        </ReflectionsArea>
      </ColumnWrapper>
    );
  }
}

reactLifecyclesCompat(PhaseItemColumn);

export default createFragmentContainer(
  withAtmosphere(PhaseItemColumn),
  graphql`
    fragment PhaseItemColumn_retroPhaseItem on RetroPhaseItem {
      ...AddReflectionButton_retroPhaseItem
      ...ReflectionDropZone_retroPhaseItem
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
      phases {
        id
        phaseType
        stages {
          isComplete
        }
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
