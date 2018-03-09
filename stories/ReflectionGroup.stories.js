/**
 * Stories for groups of reflection cards.
 *
 * @flow
 */
// $FlowFixMe
import {ContentState} from 'draft-js';
import React from 'react';
import shortid from 'shortid';
import {action} from '@storybook/addon-actions';
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
              handleSaveTitle={action('save-title')}
              reflections={[
                {id: newId(), content: ContentState.createFromText('Card'), stage: null},
                {id: newId(), content: ContentState.createFromText('Card'), stage: null}
              ]}
              title={ContentState.createFromText('')}
            />
            <ReflectionGroup
              handleSaveTitle={action('save-title')}
              reflections={[
                {id: newId(), content: ContentState.createFromText('Card'), stage: null},
                {id: newId(), content: ContentState.createFromText('Card'), stage: null},
                {id: newId(), content: ContentState.createFromText('Card'), stage: null},
                {id: newId(), content: ContentState.createFromText('Card'), stage: null}
              ]}
              title={ContentState.createFromText('')}
            />
            <ReflectionGroup
              handleSaveTitle={action('save-title')}
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
              title={ContentState.createFromText('')}
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
              hoveredHeight={40}
              reflections={[
                {id: newId(), content: ContentState.createFromText('Card'), stage: null},
                {id: newId(), content: ContentState.createFromText('Card'), stage: null}
              ]}
              title={ContentState.createFromText('')}
            />
          </Grid>
        )}
      />
    </RetroBackground>
  ));
