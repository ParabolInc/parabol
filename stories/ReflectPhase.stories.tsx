import {storiesOf} from '@storybook/react'
import React from 'react'
import ReflectionStackPlaceholder from 'universal/components/RetroReflectPhase/ReflectionStackPlaceholder'
import StoryProvider from './components/StoryProvider'
import PhaseItemEditor from 'universal/components/RetroReflectPhase/PhaseItemEditor'

storiesOf('Reflect Phase', module)
  .add('placeholder', () => (
    <StoryProvider>
      <ReflectionStackPlaceholder idx={0} />
    </StoryProvider>
  ))
  .add('editor', () => (
    <StoryProvider>
      <PhaseItemEditor/>
    </StoryProvider>
  ))
