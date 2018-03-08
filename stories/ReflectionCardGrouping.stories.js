/**
 * Stories for reflection card drag-and-drop.
 *
 * @flow
 */
import type {Reflection, ReflectionID, ReflectionGroup as ReflectionGroupT} from 'universal/types/retro';

// $FlowFixMe
import {ContentState} from 'draft-js';
import React, {Component} from 'react';
import {action} from '@storybook/addon-actions';
import {storiesOf} from '@storybook/react';

import DraggableReflectionCard from 'universal/components/ReflectionCard/DraggableReflectionCard';
import ReflectionGroupingDragLayer from 'universal/components/ReflectionGroupingDragLayer/ReflectionGroupingDragLayer';
import ReflectionGroup from 'universal/components/ReflectionGroup/ReflectionGroup';
import count from 'universal/utils/count';

import Grid from './components/Grid';
import RetroBackground from './components/RetroBackground';
import StoryContainer from './components/StoryContainer';

type DragAndDropStoryState = {
  dragging: {[ReflectionID]: boolean},
  reflections: Array<Reflection>,
  groups: Array<ReflectionGroupT>
};

class DragAndDropStory extends Component<*, DragAndDropStoryState> {
  state = {
    dragging: {
      card1: false,
      card2: false
    },
    groups: [],
    reflections: [
      {
        id: 'card1',
        content: ContentState.createFromText('My pithy reflection is to be heard'),
        stage: null
      },
      {
        id: 'card2',
        content: ContentState.createFromText('No, MY reflection shall be heard loudest!!!'),
        stage: null
      }
    ]
  };

  getReflectionById = (id: ReflectionID): ?Reflection => {
    return this.state.reflections.find((reflection) => reflection.id === id);
  };

  ids = count();

  handleCancelDrag = (cardId: ReflectionID) => {
    this.setState({dragging: {[cardId]: false}});
    action('cancel-drag')(cardId);
  };

  handleBeginDrag = (cardId: ReflectionID) => {
    this.setState({dragging: {[cardId]: true}});
    action('begin-drag')(cardId);
  };

  handleDrop = (draggedId: ReflectionID, droppedId: ReflectionID) => {
    this.setState((state: DragAndDropStoryState) => {
      const newGroup = {
        id: `reflection${this.ids.next().value}`,
        name: '',
        reflections: [this.getReflectionById(draggedId), this.getReflectionById(droppedId)].filter(Boolean)
      };
      return {
        dragging: {[draggedId]: false},
        reflections: state.reflections.filter((reflection) => !([draggedId, droppedId]).includes(reflection.id)),
        groups: [...state.groups, newGroup]
      };
    });
    action('drop')(draggedId, droppedId);
  };

  render() {
    return (
      <RetroBackground>
        <StoryContainer
          description="Group reflection cards"
          render={() => (
            <div>
              <Grid>
                {this.state.reflections.map((reflection) => (
                  <DraggableReflectionCard
                    contentState={reflection.content}
                    handleCancelDrag={this.handleCancelDrag}
                    handleBeginDrag={this.handleBeginDrag}
                    handleDrop={this.handleDrop}
                    id={reflection.id}
                    iAmDragging={this.state.dragging[reflection.id]}
                    key={reflection.id}
                    userDragging={this.state.dragging[reflection.id] && 'Dan'}
                  />
                ))}
                {this.state.groups.map((group) => (
                  <ReflectionGroup
                    reflections={group.reflections}
                    key={group.id}
                  />
                ))}
              </Grid>
              <ReflectionGroupingDragLayer getReflectionById={this.getReflectionById} />
            </div>
          )}
        />
      </RetroBackground>
    );
  }
}

storiesOf('Reflection Card Grouping', module)
  .add('drag and drop', () => (
    <DragAndDropStory />
  ));
