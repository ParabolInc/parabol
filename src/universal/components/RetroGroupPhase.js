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
    const {atmosphere, team: {newMeeting}} = this.props;
    const {draggableId: reflectionId, type, source, destination} = result;
    DragReflectionMutation(atmosphere, {reflectionId, isDragging: false});

    // dropped nowhere
    if (!destination) return;

    // did not move anywhere - can bail early
    const inSameGroup = source.droppableId === destination.droppableId;
    if (inSameGroup && source.index === destination.index) {
      return;
    }

    const {droppableId: reflectionGroupId, index} = destination;
    const {meetingId} = newMeeting;
    const reflectionGroups = newMeeting.reflectionGroups || [];
    const reflectionGroup = reflectionGroups.find((group) => group.id === reflectionGroupId);
    if (!reflectionGroup) return;
    const {reflections} = reflectionGroup;
    let sortOrder;
    if (index === 0) {
      sortOrder = reflections[0] ? reflections[0].sortOrder - 1 : 0;
    } else if (index === reflections.length || (inSameGroup && index === reflections.length -1)) {
      sortOrder = reflections[reflections.length - 1].sortOrder + 1;
    } else {
      sortOrder = (reflections[index - 1].sortOrder + reflections[index].sortOrder) / 2 + dndNoise();
    }
    const variables = {
      reflectionId,
      reflectionGroupId,
      sortOrder
    };
    UpdateReflectionLocationMutation(atmosphere, variables, {meetingId});

    // const data = reorderQuoteMap({
    //   quoteMap: this.state.columns,
    //   source,
    //   destination
    // });

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
