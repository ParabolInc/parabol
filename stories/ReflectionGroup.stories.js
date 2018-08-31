/**
 * Stories for groups of reflection cards.
 *
 */
import {ContentState} from 'draft-js'
import React from 'react'
import shortid from 'shortid'
import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react'

import ReflectionGroup from 'universal/components/ReflectionGroup/ReflectionGroup'

import Grid from './components/Grid'
import RetroBackground from './components/RetroBackground'
import StoryContainer from './components/StoryContainer'

const newId = () => shortid.generate()

storiesOf('Reflection Group', module)
  .add('with a few cards', () => (
    <RetroBackground>
      <StoryContainer
        description='Note: we only render the top four cards in the collapsed state'
        render={() => (
          <Grid>
            <ReflectionGroup
              handleSaveTitle={action('save-title')}
              id={newId()}
              reflections={[
                {
                  id: newId(),
                  content: ContentState.createFromText('This is the bottom card'),
                  reflectionPhaseQuestion: null
                },
                {
                  id: newId(),
                  content: ContentState.createFromText('This is the top card'),
                  reflectionPhaseQuestion: null
                }
              ]}
              title={''}
            />
            <ReflectionGroup
              handleSaveTitle={action('save-title')}
              id={newId()}
              reflections={[
                {
                  id: newId(),
                  content: ContentState.createFromText('Card'),
                  reflectionPhaseQuestion: null
                },
                {
                  id: newId(),
                  content: ContentState.createFromText('Card'),
                  reflectionPhaseQuestion: null
                },
                {
                  id: newId(),
                  content: ContentState.createFromText(`
                    This one has a lot to say!
                    Fortunately it does not screw up the translation computation.
                  `),
                  reflectionPhaseQuestion: null
                },
                {
                  id: newId(),
                  content: ContentState.createFromText('Card'),
                  reflectionPhaseQuestion: null
                }
              ]}
              title={''}
            />
            <ReflectionGroup
              handleSaveTitle={action('save-title')}
              id={newId()}
              reflections={[
                {
                  id: newId(),
                  content: ContentState.createFromText('Card'),
                  reflectionPhaseQuestion: null
                },
                {
                  id: newId(),
                  content: ContentState.createFromText('Card'),
                  reflectionPhaseQuestion: null
                },
                {
                  id: newId(),
                  content: ContentState.createFromText('Card'),
                  reflectionPhaseQuestion: null
                },
                {
                  id: newId(),
                  content: ContentState.createFromText('Card'),
                  reflectionPhaseQuestion: null
                },
                {
                  id: newId(),
                  content: ContentState.createFromText('Card'),
                  reflectionPhaseQuestion: null
                },
                {
                  id: newId(),
                  content: ContentState.createFromText('Card'),
                  reflectionPhaseQuestion: null
                },
                {
                  id: newId(),
                  content: ContentState.createFromText('Card'),
                  reflectionPhaseQuestion: null
                },
                {
                  id: newId(),
                  content: ContentState.createFromText('Card'),
                  reflectionPhaseQuestion: null
                },
                {
                  id: newId(),
                  content: ContentState.createFromText('Card'),
                  reflectionPhaseQuestion: null
                }
              ]}
              title={''}
            />
          </Grid>
        )}
      />
    </RetroBackground>
  ))

  .add('with drop placeholder', () => (
    <RetroBackground>
      <StoryContainer
        render={() => (
          <Grid>
            <ReflectionGroup
              handleSaveTitle={action('save-title')}
              id={newId()}
              hovered
              reflections={[
                {
                  id: newId(),
                  content: ContentState.createFromText('Card'),
                  reflectionPhaseQuestion: null
                },
                {
                  id: newId(),
                  content: ContentState.createFromText('Card'),
                  reflectionPhaseQuestion: null
                }
              ]}
              title={''}
            />
          </Grid>
        )}
      />
    </RetroBackground>
  ))
