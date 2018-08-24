import {number, withKnobs} from '@storybook/addon-knobs'
import {storiesOf} from '@storybook/react'
import {convertToRaw, ContentState} from 'draft-js'
import React from 'react'
import PhaseItemEditor from 'universal/components/RetroReflectPhase/PhaseItemEditor'
import ReflectionStackPlaceholder from 'universal/components/RetroReflectPhase/ReflectionStackPlaceholder'
import makeEmptyStr from 'universal/utils/draftjs/makeEmptyStr'
import PhaseItemChits from '../src/universal/components/RetroReflectPhase/PhaseItemChits'
import PhaseItemColumn from '../src/universal/components/RetroReflectPhase/PhaseItemColumn'
import PhaseItemHealthBar from '../src/universal/components/RetroReflectPhase/PhaseItemHealthBar'
import ReflectionStack from '../src/universal/components/RetroReflectPhase/ReflectionStack'
import StoryProvider from './components/StoryProvider'
import {REFLECT} from 'universal/utils/constants'

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
      <ReflectionStack
        idx={1}
        reflectionStack={[{
          reflectionId: 'refl1',
          reflectionGroupId: 'reflG1',
          content: JSON.stringify(convertToRaw(ContentState.createFromText('hee haw'))),
          isViewerCreator: true,
          phaseItem: {
            question: 'What do'
          }
        }]}
        meeting={{
          meetingId: 'meet1',
          teamId: 'team1',
          localPhase: {
            phaseType: REFLECT
          },
          localStage: {
            isComplete: false
          },
          phases: {
            phaseType: REFLECT,
            stages: {
              isComplete: false
            }
          }
        }}
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
