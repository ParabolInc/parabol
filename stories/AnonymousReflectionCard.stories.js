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

const randomChar = () => String.fromCharCode(97 + Math.floor(Math.random() * 26));

// Given a string, returns another string which has the same "shape", e.g.
// same punctuation and word length, but with completely random characters.
const obfuscate = (content: string): string => (
  content
    .split('')
    .map((char) =>
      /^[a-z0-9]+$/i.test(char) ? randomChar() : char
    )
    .join('')
);

storiesOf('AnonymousReflectionCard', module)
  .add('being edited', () => (
    <RetroBackground>
      <StoryContainer
        render={() => (
          <AnonymousReflectionCard isEditing />
        )}
      />
    </RetroBackground>
  ))
  .add('not being edited', () => (
    <RetroBackground>
      <StoryContainer
        render={() => (
          <AnonymousReflectionCard content={obfuscate("Hello world! It's me, Dan.")} />
        )}
      />
    </RetroBackground>
  ));
