/**
 * Stories for the ReflectionCard component.
 *
 * @flow
 */
import type {Reflection, ReflectionID} from 'universal/types/retro';

// $FlowFixMe
import {ContentState} from 'draft-js';
import React, {Component} from 'react';
import shortid from 'shortid';
import {action} from '@storybook/addon-actions';
import {storiesOf} from '@storybook/react';

import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard';
import DraggableReflectionCard from 'universal/components/ReflectionCard/DraggableReflectionCard';
import ReflectionGroupingDragLayer from 'universal/components/ReflectionGroupingDragLayer/ReflectionGroupingDragLayer';

import Grid from './components/Grid';
import RetroBackground from './components/RetroBackground';
import StoryContainer from './components/StoryContainer';

const newReflectionId = () => shortid.generate();

storiesOf('ReflectionCard', module)
  .add('with no contents', () => (
    <RetroBackground>
      <StoryContainer
        render={() => (
          <ReflectionCard
            id={newReflectionId()}
            contentState={ContentState.createFromText('')}
            handleDelete={action('handle-delete')}
            handleSave={action('handle-save')}
          />
        )}
      />
    </RetroBackground>
  ))

  .add('with one line', () => (
    <RetroBackground>
      <StoryContainer
        render={() => (
          <ReflectionCard
            id={newReflectionId()}
            contentState={ContentState.createFromText('One line of text.')}
            handleDelete={action('handle-delete')}
            handleSave={action('handle-save')}
          />
        )}
      />
    </RetroBackground>
  ))

  .add('with many lines', () => (
    <RetroBackground>
      <StoryContainer
        render={() => (
          <ReflectionCard
            id={newReflectionId()}
            contentState={
              ContentState.createFromText(
                'This is a long observation. ' +
                'I have a lot of feelings and want my team to know. ' +
                "There's much to say, and I hope people have the patience to read this because it's, like, super important. " +
                'At some point, this will get really long, and it should probably overflow by scrolling. ' +
                "I hope folks don't get mad at me for writing so much. " +
                'Seriously. When will I stop??'
              )
            }
            handleDelete={action('handle-delete')}
            handleSave={action('handle-save')}
          />
        )}
      />
    </RetroBackground>
  ))

  .add('read-only', () => (
    <RetroBackground>
      <StoryContainer
        render={() => (
          <ReflectionCard
            id={newReflectionId()}
            contentState={ContentState.createFromText('I cannot be edited or removed!')}
          />
        )}
      />
    </RetroBackground>
  ))

  .add('with stage', () => (
    <RetroBackground>
      <StoryContainer
        render={() => (
          <Grid>
            {[undefined, 'positive', 'negative', 'change'].map((stage) => (
              <ReflectionCard
                id={newReflectionId()}
                contentState={ContentState.createFromText('Edit me!')}
                handleDelete={action('handle-delete')}
                handleSave={action('handle-save')}
                key={stage || 'undefined'}
                stage={stage}
              />
            ))}
          </Grid>
        )}
      />
    </RetroBackground>
  ))

  .add('drag states', () => (
    <RetroBackground>
      <StoryContainer
        description={
          'Shows the states of a card which is being dragged by a teammate or oneself. ' +
          'When being dragged, the card is seen twice; where it is being dragged from, ' +
          'and its current instance being pulled under the mouse'
        }
        render={() => (
          <Grid>
            <ReflectionCard
              contentState={ContentState.createFromText('Holding the original place for me as I drag')}
              iAmDragging
              id={newReflectionId()}
              userDragging="Dan"
            />
            <ReflectionCard
              contentState={ContentState.createFromText('Holding the original place for another user as they drag')}
              id={newReflectionId()}
              userDragging="Terry"
            />
            <ReflectionCard
              contentState={ContentState.createFromText('Pulled under the mouse')}
              id={newReflectionId()}
              pulled
              userDragging="Dan"
            />
            <ReflectionCard
              id={newReflectionId()}
              contentState={ContentState.createFromText('Hovered over by another card')}
              hovered
            />
          </Grid>
        )}
      />
    </RetroBackground>
  ))

  .add('drag and drop', () => (
    <DragAndDropStory />
  ));

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

  handleBeginDrag = (cardId: 'card1' | 'card2') => {
    this.setState({[cardId]: true});
  };

  handleEndDrag = (cardId: 'card1' | 'card2') => {
    this.setState({[cardId]: false});
  };

  render() {
    const card1 = this.cards.card1;
    const card2 = this.cards.card2;
    const card1DragState = this.state.card1;
    const card2DragState = this.state.card2;
    return (
      <RetroBackground>
        <StoryContainer
          description="Play around with drag-and-drop"
          render={() => (
            <div>
              <Grid>
                <DraggableReflectionCard
                  handleBeginDrag={this.handleBeginDrag}
                  handleEndDrag={this.handleEndDrag}
                  id={card1.id}
                  iAmDragging={card1DragState}
                  contentState={card1.content}
                  userDragging={card1DragState && 'Dan'}
                />
                <DraggableReflectionCard
                  handleBeginDrag={this.handleBeginDrag}
                  handleEndDrag={this.handleEndDrag}
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
