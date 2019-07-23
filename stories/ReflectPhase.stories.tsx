import {number, withKnobs} from '@storybook/addon-knobs'
import {storiesOf} from '@storybook/react'
import {ContentState, convertToRaw} from 'draft-js'
import React from 'react'
import PhaseItemColumn from 'universal/components/RetroReflectPhase/PhaseItemColumn'
import PhaseItemEditor from 'universal/components/RetroReflectPhase/PhaseItemEditor'
import ReflectionStackPlaceholder from 'universal/components/RetroReflectPhase/ReflectionStackPlaceholder'
import PhaseItemChits from '../packages/universal/components/RetroReflectPhase/PhaseItemChits'
import PhaseItemHealthBar from '../packages/universal/components/RetroReflectPhase/PhaseItemHealthBar'
import ReflectionStack from '../packages/universal/components/RetroReflectPhase/ReflectionStack'
import StoryProvider from './components/StoryProvider'

const meeting = {
  reflectionGroups: [],
  localPhase: {focusedPhaseItemId: '123', phaseId: '123'},
  localStage: {isComplete: false}
}

const reflectionStack = [
  {
    id: 'refl1',
    reflectionGroupId: 'reflG1',
    content: JSON.stringify(convertToRaw(ContentState.createFromText('hee haw'))),
    phaseItem: {
      question: 'What do'
    }
  }
]

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
        meetingId='123'
        retroPhaseItemId='124'
        nextSortOrder={() => 2}
        phaseEditorRef={undefined as any}
      />
    </StoryProvider>
  ))
  .add('health bar', () => (
    <StoryProvider>
      <PhaseItemHealthBar editorCount={number('editorCount', 1)} />
    </StoryProvider>
  ))
  .add('chits', () => (
    <StoryProvider>
      <PhaseItemChits editorCount={number('editorCount', 2)} count={number('chitCount', 3)} />
    </StoryProvider>
  ))
  .add('reflection stack', () => (
    <StoryProvider>
      <ReflectionStack
        idx={1}
        reflectionStack={reflectionStack as any}
        meetingId='meet1'
        phaseItemId='pi1'
        phaseRef={undefined as any}
        phaseEditorRef={undefined as any}
        readOnly={false}
      />
    </StoryProvider>
  ))
  .add('column', () => (
    <StoryProvider>
      <PhaseItemColumn
        description={'foo'}
        idx={0}
        editorIds={[]}
        retroPhaseItemId='123'
        meeting={meeting as any}
        phaseRef={undefined as any}
        question='What do'
      />
    </StoryProvider>
  ))
