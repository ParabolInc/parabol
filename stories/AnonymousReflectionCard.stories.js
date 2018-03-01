/**
 * Stories for the AnonymousReflectionCard component.
 *
 * @flow
 */

import React from 'react';
import {storiesOf} from '@storybook/react';

import AnonymousReflectionCard from 'universal/components/AnonymousReflectionCard/AnonymousReflectionCard';

import RetroBackground from './components/RetroBackground';
import StoryContainer from './components/StoryContainer';

storiesOf('AnonymousReflectionCard', module)
  .add('being edited', () => (
    <StoryContainer
      render={() => (
        <RetroBackground>
          <AnonymousReflectionCard isEditing />
        </RetroBackground>
      )}
    />
  ))
  .add('not being edited', () => (
    <StoryContainer
      render={() => (
        <RetroBackground>
          <AnonymousReflectionCard />
        </RetroBackground>
      )}
    />
  ));
