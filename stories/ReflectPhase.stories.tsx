import {storiesOf} from '@storybook/react'
import React from 'react'
import PhaseItemEditor from 'universal/components/RetroReflectPhase/PhaseItemEditor'
import ReflectionStackPlaceholder from 'universal/components/RetroReflectPhase/ReflectionStackPlaceholder'
import PhaseItemChits from '../src/universal/components/RetroReflectPhase/PhaseItemChits'
import PhaseItemHealthBar from '../src/universal/components/RetroReflectPhase/PhaseItemHealthBar'
import StoryProvider from './components/StoryProvider'
import Incrementor from './helpers/Incrementor'

const state = {
  health: new Incrementor(0, 5),
  chits: new Incrementor(0, 25)
}

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
      <state.health.Button />
      <PhaseItemHealthBar editorsCount={state.health.num} />
    </StoryProvider>
  ))
  .add('chits', () => (
    <StoryProvider>
      <state.chits.Button />
      <PhaseItemChits count={state.chits.num} />
    </StoryProvider>
  ))
