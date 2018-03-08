/**
 * Stories for reflection card drag-and-drop.
 *
 * @flow
 */
import type {Reflection, ReflectionID} from 'universal/types/retro';

// $FlowFixMe
import {ContentState} from 'draft-js';
import React, {Component} from 'react';
import {action} from '@storybook/addon-actions';
import {storiesOf} from '@storybook/react';

import DraggableReflectionCard from 'universal/components/ReflectionCard/DraggableReflectionCard';
import ReflectionGroupingDragLayer from 'universal/components/ReflectionGroupingDragLayer/ReflectionGroupingDragLayer';

import Grid from './components/Grid';
import RetroBackground from './components/RetroBackground';
import StoryContainer from './components/StoryContainer';

type DragAndDropStoryState = {
  card1: boolean,
  card2: boolean
};

class DragAndDropStory extends Component<*, DragAndDropStoryState> {
  state = {
    card1: false,
    card2: false
  };

  getReflectionById = (id: ReflectionID): Reflection => {
    return this.cards[id];
  };

  cards = {
    card1: {
      id: 'card1',
      content: ContentState.createFromText('My pithy reflection is to be heard')
    },
    card2: {
      id: 'card2',
      content: ContentState.createFromText('No, MY reflection shall be heard loudest!!!')
    }
  };

  handleCancelDrag = (cardId: 'card1' | 'card2') => {
    this.setState({[cardId]: false});
    action('cancel-drag')(cardId);
  };

  handleBeginDrag = (cardId: 'card1' | 'card2') => {
    this.setState({[cardId]: true});
    action('begin-drag')(cardId);
  };

  handleDrop = (draggedId: 'card1' | 'card2', droppedId: 'card1' | 'card2') => {
    this.setState({[draggedId]: false});
    action('drop')(draggedId, droppedId);
  };

  render() {
    const card1 = this.cards.card1;
    const card2 = this.cards.card2;
    const card1DragState = this.state.card1;
    const card2DragState = this.state.card2;
    return (
      <RetroBackground>
        <StoryContainer
          description="Group reflection cards"
          render={() => (
            <div>
              <Grid>
                <DraggableReflectionCard
                  handleCancelDrag={this.handleCancelDrag}
                  handleBeginDrag={this.handleBeginDrag}
                  handleDrop={this.handleDrop}
                  id={card1.id}
                  iAmDragging={card1DragState}
                  contentState={card1.content}
                  userDragging={card1DragState && 'Dan'}
                />
                <DraggableReflectionCard
                  handleCancelDrag={this.handleCancelDrag}
                  handleBeginDrag={this.handleBeginDrag}
                  handleDrop={this.handleDrop}
                  iAmDragging={card2DragState}
                  id={card2.id}
                  contentState={card2.content}
                  userDragging={card2DragState && 'Dan'}
                />
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
