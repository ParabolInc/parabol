/**
 * Stories for the ReflectionCard component.
 *
 * @flow
 */

import React from 'react';
import styled from 'react-emotion';
import {action} from '@storybook/addon-actions';
import {storiesOf} from '@storybook/react';

import ReflectionCard from 'universal/components/ReflectionCard/ReflectionCard';

import StoryContainer from './components/StoryContainer';

const RetroBackground = styled('div')({
  backgroundColor: '#F1F0FA',
  padding: '1rem',
  height: '100%',
  width: '100%'
});

storiesOf('ReflectionCard', module)
  .add('with no contents', () => (
    <StoryContainer
      render={() => (
        <RetroBackground>
          <ReflectionCard
            contents=""
            handleDelete={action('clicked-delete')}
          />
        </RetroBackground>
      )}
    />
  ))
  .add('with one line', () => (
    <StoryContainer
      render={() => (
        <RetroBackground>
          <ReflectionCard
            contents="One line of text."
            handleDelete={action('clicked-delete')}
          />
        </RetroBackground>
      )}
    />
  ))
  .add('with many lines', () => (
    <StoryContainer
      render={() => (
        <RetroBackground>
          <ReflectionCard
            contents={
              'This is a long observation. ' +
              'I have a lot of feelings and want my team to know. ' +
              "There's much to say, and I hope people have the patience to read this because it's, like, super important. " +
              'At some point, this will get really long, and it should probably overflow by scrolling. ' +
              "I hope folks don't get mad at me for writing so much. " +
              'Seriously. When will I stop??'
            }
            handleDelete={action('clicked-delete')}
          />
        </RetroBackground>
      )}
    />
  ));
