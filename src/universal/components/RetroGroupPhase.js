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
import type {DraggableLocation, DragStart, DroppableProvided, DropResult} from 'react-beautiful-dnd';
import {DragDropContext} from 'react-beautiful-dnd';

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

  onDragStart = (initial: DragStart) => {
    // publishOnDragStart(initial);
    console.log('drag start');
    this.setState({
      autoFocusReflectionId: null
    });
  }

  onDragEnd = (result: DropResult) => {
    // publishOnDragEnd(result);
    console.log('drag end', result.type, result);

    // dropped nowhere
    if (!result.destination) {
      return;
    }

    const source: DraggableLocation = result.source;
    const destination: DraggableLocation = result.destination;

    // did not move anywhere - can bail early
    if (source.droppableId === destination.droppableId &&
      source.index === destination.index) {
      return;
    }

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
  RetroGroupPhase,
  graphql`
    fragment RetroGroupPhase_team on Team {
      newMeeting {
        ...PhaseItemColumn_meeting
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
