/**
 * Stories for groups of reflection cards.
 *
 * @flow
 */
// $FlowFixMe
import {ContentState} from 'draft-js';
import React from 'react';
import shortid from 'shortid';
import {storiesOf} from '@storybook/react';

import ReflectionGroup from 'universal/components/ReflectionGroup/ReflectionGroup';

import Grid from './components/Grid';
import RetroBackground from './components/RetroBackground';
import StoryContainer from './components/StoryContainer';

const newId = () => shortid.generate();

storiesOf('Reflection Group', module)
  .add('with a few cards', () => (
    <RetroBackground>
      <StoryContainer
        description="Note: we only render the top five cards in the collapsed state"
        render={() => (
          <Grid>
            <ReflectionGroup
              reflections={[
                {id: newId(), content: ContentState.createFromText('Card'), stage: null},
                {id: newId(), content: ContentState.createFromText('Card'), stage: null}
              ]}
            />
            <ReflectionGroup
              reflections={[
                {id: newId(), content: ContentState.createFromText('Card'), stage: null},
                {id: newId(), content: ContentState.createFromText('Card'), stage: null},
                {id: newId(), content: ContentState.createFromText('Card'), stage: null},
                {id: newId(), content: ContentState.createFromText('Card'), stage: null}
              ]}
            />
            <ReflectionGroup
              reflections={[
                {id: newId(), content: ContentState.createFromText('Card'), stage: null},
                {id: newId(), content: ContentState.createFromText('Card'), stage: null},
                {id: newId(), content: ContentState.createFromText('Card'), stage: null},
                {id: newId(), content: ContentState.createFromText('Card'), stage: null},
                {id: newId(), content: ContentState.createFromText('Card'), stage: null},
                {id: newId(), content: ContentState.createFromText('Card'), stage: null},
                {id: newId(), content: ContentState.createFromText('Card'), stage: null},
                {id: newId(), content: ContentState.createFromText('Card'), stage: null},
                {id: newId(), content: ContentState.createFromText('Card'), stage: null}
              ]}
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
              reflections={[
                {id: newId(), content: ContentState.createFromText('Card'), stage: null},
                {id: newId(), content: ContentState.createFromText('Card'), stage: null}
              ]}
              hoveredHeight={40}
            />
          </Grid>
        )}
      />
    </RetroBackground>
  ));
