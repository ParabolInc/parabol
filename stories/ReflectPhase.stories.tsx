import {storiesOf} from '@storybook/react'
import React from 'react'
import PhaseItemEditor from 'universal/components/RetroReflectPhase/PhaseItemEditor'
import ReflectionStackPlaceholder from 'universal/components/RetroReflectPhase/ReflectionStackPlaceholder'
import PhaseItemHealthBar from '../src/universal/components/RetroReflectPhase/PhaseItemHealthBar'
import StoryProvider from './components/StoryProvider'

storiesOf('Reflect Phase', module)
  .add('placeholder', () => (
    <StoryProvider>
      <ReflectionStackPlaceholder idx={0} />
    </StoryProvider>
  ))
  .add('editor', () => (
    <StoryProvider>
      <PhaseItemEditor />
    </StoryProvider>
  ))
  .add('health bar', () => (
    <StoryProvider>
      <PhaseItemHealthBar strength={2} />
    </StoryProvider>
  ))
