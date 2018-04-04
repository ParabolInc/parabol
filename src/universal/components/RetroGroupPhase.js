/**
 * Renders the UI for the reflection phase of the retrospective meeting
 *
 * @flow
 */
import * as React from 'react';
import styled from 'react-emotion';
import type {RetroGroupPhase_team as Team} from './__generated__/RetroGroupPhase_team.graphql';
import PhaseItemColumn from 'universal/components/RetroReflectPhase/PhaseItemColumn';
import {createFragmentContainer} from 'react-relay';
import type {DragStart, DropResult} from 'react-beautiful-dnd/src/index';
import {DragDropContext} from 'react-beautiful-dnd';
import UpdateReflectionLocationMutation from 'universal/mutations/UpdateReflectionLocationMutation';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import dndNoise from 'universal/utils/dndNoise';
import DragReflectionMutation from 'universal/mutations/DragReflectionMutation';

const {Component} = React;

type Props = {
  team: Team,
};

type State = {
  autoFocusReflectionId: ?string
}
const GroupPhaseWrapper = styled('div')({
  height: '100%',
  display: 'flex',
  justifyContent: 'space-around',
  width: '100%'
});

const getSortOrder = (index, children, inSameGroup) => {
  if (index === 0) return children[0] ? children[0].sortOrder - 1 : 0;
  if (index === children.length || (inSameGroup && index === children.length -1)) return children[children.length - 1].sortOrder + 1;
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
  return undefined;
};

class RetroGroupPhase extends Component<Props, State> {
  state: State = {
    autoFocusReflectionId: null
  };

  onDragStart = (dragStart: DragStart) => {
    const {atmosphere} = this.props;
    const {draggableId: reflectionId} = dragStart;
    this.setState({
      autoFocusReflectionId: null
    });
    DragReflectionMutation(atmosphere, {reflectionId, isDragging: true});
  }

  onDragEnd = (result: DropResult) => {
    const {atmosphere, team} = this.props;
    const {newMeeting} = team;
    const {draggableId: reflectionId, source, destination} = result;
    DragReflectionMutation(atmosphere, {reflectionId, isDragging: false});

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
    const {meetingId} = newMeeting;
    const variables = {
      reflectionId,
      reflectionGroupId: dropType === 'reflectionGroupId' ? droppableId : null,
      retroPhaseItemId: dropType === 'retroPhaseItemId' ? droppableId : undefined,
      sortOrder: getSortOrder(index, children, inSameGroup)
    };
    UpdateReflectionLocationMutation(atmosphere, variables, {meetingId});
    // this.setState({
    // autoFocusReflectionId: data.autoFocusReflectionId
    // });
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
};

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
            sortOrder
            reflections {
              id
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
