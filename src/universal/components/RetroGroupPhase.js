/**
 * Renders the UI for the reflection phase of the retrospective meeting
 *
 * @flow
 */
import * as React from 'react';
import styled from 'react-emotion';
// import type {RetroGroupPhase_team as Team} from './__generated__/RetroGroupPhase_team.graphql';
import PhaseItemColumn from 'universal/components/RetroReflectPhase/PhaseItemColumn';
import {commitLocalUpdate, createFragmentContainer} from 'react-relay';
import type {DragStart, DropResult} from 'react-beautiful-dnd/src/index';
import {DragDropContext} from 'react-beautiful-dnd';
import UpdateReflectionLocationMutation from 'universal/mutations/UpdateReflectionLocationMutation';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import dndNoise from 'universal/utils/dndNoise';
import DragReflectionMutation from 'universal/mutations/DragReflectionMutation';

const {Component} = React;

type Props = {
  atmosphere: Object,
  // flow or relay-compiler is getting really confused here, so I don't use the flow type here
  team: Object,
};

const GroupPhaseWrapper = styled('div')({
  display: 'flex',
  height: '100%',
  justifyContent: 'space-around',
  width: '100%'
});

const getSortOrder = (index, children, inSameGroup) => {
  if (index === 0) return children[0] ? children[0].sortOrder - 1 : 0;
  if (index === children.length || (inSameGroup && index === children.length - 1)) return children[children.length - 1].sortOrder + 1;
  return (children[index - 1].sortOrder + children[index].sortOrder) / 2 + dndNoise();
};

const getChildren = (team, droppableId) => {
  const {meetingSettings, newMeeting} = team;
  const reflectionGroups = newMeeting.reflectionGroups || [];
  const reflectionGroup = reflectionGroups.find((group) => group.id === droppableId);
  if (reflectionGroup) return {dropType: 'reflectionGroupId', children: reflectionGroup.reflections};
  const phaseItems = meetingSettings.phaseItems || [];
  const retroPhaseItem = phaseItems.find((phaseItem) => phaseItem.id === droppableId);
  if (retroPhaseItem) return {dropType: 'retroPhaseItemId', children: reflectionGroups};
  return {};
};

class RetroGroupPhase extends Component<Props> {
  constructor(props) {
    super(props);
    const {atmosphere, team} = props;
    const {meetingSettings} = team;
    const phaseItems = meetingSettings.phaseItems || [];
    // if a reflection is by itself at the bottom of a column, it's weird to see it be dragged to the dropzone below it & then shift up
    // this fixes it by disabling the dropzone for single-reflection groups residing in the same column
    commitLocalUpdate(atmosphere, (store) => {
      phaseItems.forEach((phaseItem) => {
        const phaseItemProxy = store.get(phaseItem.id);
        if (phaseItemProxy) {
          phaseItemProxy.setValue(true, 'isDropZoneEnabled');
        }
      });
    });
  }

  onDragStart = (dragStart: DragStart) => {
    const {atmosphere, team: {newMeeting}} = this.props;
    const {draggableId: reflectionId} = dragStart;
    DragReflectionMutation(atmosphere, {reflectionId, isDragging: true});
    const {reflectionGroups} = newMeeting;
    const group = reflectionGroups.find((reflectionGroup) => reflectionGroup.reflections.some((reflection) => reflection.id ===
      reflectionId));
    const {reflections, retroPhaseItemId} = group;
    const isDropZoneEnabled = reflections.length > 1;
    // setTimeout required otherwise we get a warning https://github.com/atlassian/react-beautiful-dnd/issues/426
    setTimeout(() => {
      commitLocalUpdate(atmosphere, (store) => {
        const phaseItemProxy = store.get(retroPhaseItemId);
        if (phaseItemProxy) {
          phaseItemProxy.setValue(isDropZoneEnabled, 'isDropZoneEnabled');
        }
      });
    });
  }

  onDragEnd = (result: DropResult) => {
    const {atmosphere, team} = this.props;
    const {meetingSettings, newMeeting} = team;
    const {draggableId: reflectionId, source, destination} = result;
    DragReflectionMutation(atmosphere, {reflectionId, isDragging: false});

    // re-enable drop zones
    const phaseItems = meetingSettings.phaseItems || [];
    commitLocalUpdate(atmosphere, (store) => {
      phaseItems.forEach((phaseItem) => {
        const phaseItemProxy = store.get(phaseItem.id);
        if (phaseItemProxy) {
          phaseItemProxy.setValue(true, 'isDropZoneEnabled');
        }
      });
    });

    // dropped nowhere
    if (!destination) return;

    // did not move anywhere - can bail early
    const inSameGroup = source.droppableId === destination.droppableId;
    if (inSameGroup && source.index === destination.index) {
      return;
    }

    const {droppableId, index} = destination;
    const {dropType, children} = getChildren(team, droppableId);
    if (!dropType) return;

    let nextReflectionId = reflectionId;
    let nextReflectionGroupId = dropType === 'reflectionGroupId' ? droppableId : null;
    if (dropType === 'retroPhaseItemId') {
      const oldGroup = children.find((reflectionGroup) => reflectionGroup.reflections.some((reflection) => reflection.id === reflectionId));
      if (!oldGroup) return;
      if (oldGroup.reflections.length === 1) {
        // don't move a reflection from its own group to a new group in the same column
        if (oldGroup.retroPhaseItemId === droppableId) return;
        // move a single group to a different column
        nextReflectionId = null;
        nextReflectionGroupId = oldGroup.id;
      }
    }
    const {meetingId} = newMeeting;
    const variables = {
      reflectionId: nextReflectionId,
      reflectionGroupId: nextReflectionGroupId,
      retroPhaseItemId: dropType === 'retroPhaseItemId' ? droppableId : undefined,
      sortOrder: dropType === 'retroPhaseItemId' ? children.length : getSortOrder(index, children, inSameGroup)
    };
    UpdateReflectionLocationMutation(atmosphere, variables, {meetingId});
  }

  render() {
    const {team} = this.props;
    const {newMeeting, meetingSettings} = team;
    const phaseItems = meetingSettings.phaseItems || [];
    return (
      <DragDropContext
        onDragStart={this.onDragStart}
        onDragEnd={this.onDragEnd}
      >
        <GroupPhaseWrapper>
          {phaseItems.map((phaseItem, idx) =>
            <PhaseItemColumn dndIndex={idx} meeting={newMeeting} key={phaseItem.id} retroPhaseItem={phaseItem} />
          )}
        </GroupPhaseWrapper>
      </DragDropContext>
    );
  }
}

export default createFragmentContainer(
  withAtmosphere(RetroGroupPhase),
  graphql`
    fragment RetroGroupPhase_team on Team {
      newMeeting {
        meetingId: id
        ...PhaseItemColumn_meeting
        ... on RetrospectiveMeeting {
          reflectionGroups {
            id
            meetingId
            sortOrder
            retroPhaseItemId
            reflections {
              id
              retroPhaseItemId
              sortOrder
            }
          }
        }
      }
      meetingSettings(meetingType: $meetingType) {
        ... on RetrospectiveMeetingSettings {
          phaseItems {
            ... on RetroPhaseItem {
              id
              ...PhaseItemColumn_retroPhaseItem
            }
          }
        }
      }
    }
  `
);
