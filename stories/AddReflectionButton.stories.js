/**
 * Stories for the AddReflectionButton component.
 *
 * @flow
 */

import React from 'react';
import {action} from '@storybook/addon-actions';
import {storiesOf} from '@storybook/react';

import AddReflectionButton from 'universal/components/AddReflectionButton/AddReflectionButton';

import RetroBackground from './components/RetroBackground';
import StoryContainer from './components/StoryContainer';

storiesOf('AddReflectionButton', module)
  .add('adds a reflection', () => (
    <StoryContainer
      render={() => (
        <RetroBackground>
          <AddReflectionButton
            handleClick={action('handle-click-add-reflection')}
          />
        </RetroBackground>
      )}
    />
  ));
