import {number, withKnobs} from '@storybook/addon-knobs'
import {storiesOf} from '@storybook/react'
import React from 'react'
import PhaseItemEditor from 'universal/components/RetroReflectPhase/PhaseItemEditor'
import ReflectionStackPlaceholder from 'universal/components/RetroReflectPhase/ReflectionStackPlaceholder'
import PhaseItemChits from '../src/universal/components/RetroReflectPhase/PhaseItemChits'
import PhaseItemColumn from '../src/universal/components/RetroReflectPhase/PhaseItemColumn'
import PhaseItemHealthBar from '../src/universal/components/RetroReflectPhase/PhaseItemHealthBar'
import ReflectionStack from '../src/universal/components/RetroReflectPhase/ReflectionStack'
import StoryProvider from './components/StoryProvider'

storiesOf('Reflect Phase', module)
  .addDecorator(withKnobs)
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
      <PhaseItemHealthBar editorsCount={number('editorsCount', 1)} />
    </StoryProvider>
  ))
  .add('chits', () => (
    <StoryProvider>
      <PhaseItemChits count={number('chitCount', 3)} />
    </StoryProvider>
  ))
  .add('reflection stack', () => (
    <StoryProvider>
      <ReflectionStack idx={1} reflectionStack={[]} />
    </StoryProvider>
  ))
  .add('column', () => (
    <StoryProvider>
      <PhaseItemColumn
        idx={0}
        retroPhaseItem={{retroPhaseItemId: 123, question: 'What do?'}}
        meeting={{
          reflectionGroups: [],
          localPhase: {focusedPhaseItemId: 123, phaseId: 123},
          localStage: {isComplete: false}
        }}
      />
    </StoryProvider>
  ))
