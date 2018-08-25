import {number, withKnobs} from '@storybook/addon-knobs'
import {storiesOf} from '@storybook/react'
import {PhaseItemEditor_meeting} from '__generated__/PhaseItemEditor_meeting.graphql'
import {PhaseItemEditor_retroPhaseItem} from '__generated__/PhaseItemEditor_retroPhaseItem.graphql'
import {ReflectionCard_reflection} from '__generated__/ReflectionCard_reflection.graphql'
import {ContentState, convertToRaw} from 'draft-js'
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
      <PhaseItemEditor
        meeting={{meetingId: '123'} as PhaseItemEditor_meeting}
        retroPhaseItem={{retroPhaseItemId: '124'} as PhaseItemEditor_retroPhaseItem}
        reflectionStack={[]}
      />
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
      <ReflectionStack
        idx={1}
        reflectionStack={[{
          reflectionId: 'refl1',
          reflectionGroupId: 'reflG1',
          content: JSON.stringify(convertToRaw(ContentState.createFromText('hee haw'))),
          phaseItem: {
            question: 'What do'
          }
        } as ReflectionCard_reflection]}
        meetingId='meet1'
        phaseItemId='pi1'
      />
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
