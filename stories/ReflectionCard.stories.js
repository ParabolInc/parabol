/**
 * Stories for the ReflectionCard component.
 *
 * @flow
 */

// $FlowFixMe
import {ContentState} from 'draft-js';
import React from 'react';
import {action} from '@storybook/addon-actions';
import {storiesOf} from '@storybook/react';

import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard';

import Grid from './components/Grid';
import RetroBackground from './components/RetroBackground';
import StoryContainer from './components/StoryContainer';

storiesOf('ReflectionCard', module)
  .add('with no contents', () => (
    <RetroBackground>
      <StoryContainer
        render={() => (
          <ReflectionCard
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
                contentState={ContentState.createFromText('Edit me!')}
                handleDelete={action('handle-delete')}
                handleSave={action('handle-save')}
                stage={stage}
              />
            ))}
          </Grid>
        )}
      />
    </RetroBackground>
  ))

  .add('being dragged', () => (
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
              contentState={ContentState.createFromText('Sitting in the "from" state')}
              userDragging="Dan"
            />
            <ReflectionCard
              contentState={ContentState.createFromText('Pulled under the mouse')}
              pulled
              userDragging="Dan"
            />
          </Grid>
        )}
      />
    </RetroBackground>
  ));
