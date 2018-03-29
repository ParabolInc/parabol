/**
 * Stories for the AnonymousReflectionCard component.
 *
 * @flow
 */

// $FlowFixMe
import {ContentState} from 'draft-js';
import React from 'react';
import {storiesOf} from '@storybook/react';

import AnonymousReflectionCard from 'universal/components/AnonymousReflectionCard/AnonymousReflectionCard';

import RetroBackground from './components/RetroBackground';
import StoryContainer from './components/StoryContainer';

storiesOf('Anonymous Reflection Card', module)
  .add('being edited', () => (
    <RetroBackground>
      <StoryContainer
        render={() => (
          <AnonymousReflectionCard isEditing contentState={ContentState.createFromText('')} />
        )}
      />
    </RetroBackground>
  ))
  .add('not being edited', () => (
    <RetroBackground>
      <StoryContainer
        render={() => (
          <AnonymousReflectionCard contentState={ContentState.createFromText("Hello world! It's me, Dan.")} />
        )}
      />
    </RetroBackground>
  ));
