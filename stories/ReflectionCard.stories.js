/**
 * Stories for the ReflectionCard component.
 *
 * @flow
 */
// $FlowFixMe
import {ContentState} from 'draft-js';
import React from 'react';
import shortid from 'shortid';
import {action} from '@storybook/addon-actions';
import {storiesOf} from '@storybook/react';

import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard';

import Grid from './components/Grid';
import RetroBackground from './components/RetroBackground';
import StoryContainer from './components/StoryContainer';

const newReflectionId = () => shortid.generate();

storiesOf('Reflection Card', module)
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

  .add('with reflectionType', () => (
    <RetroBackground>
      <StoryContainer
        render={() => (
          <Grid>
            {[undefined, 'positive', 'negative', 'change'].map((reflectionType) => (
              <ReflectionCard
                id={newReflectionId()}
                contentState={ContentState.createFromText('Edit me!')}
                handleDelete={action('handle-delete')}
                handleSave={action('handle-save')}
                key={reflectionType || 'undefined'}
                reflectionType={reflectionType}
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
  ));
