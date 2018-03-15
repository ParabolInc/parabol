/**
 * Stories for the ReflectionCardDropPreview component.
 *
 * @flow
 */

// $FlowFixMe
import React from 'react';
import {storiesOf} from '@storybook/react';

import ReflectionCardDropPreview from 'universal/components/ReflectionCardDropPreview/ReflectionCardDropPreview';

import Grid from './components/Grid';
import RetroBackground from './components/RetroBackground';
import StoryContainer from './components/StoryContainer';

storiesOf('Reflection Card Drop Preview', module)
  .add('has a constant height', () => (
    <RetroBackground>
      <StoryContainer
        description="Shows where a reflection card will drop"
        render={() => (
          <Grid>
            <ReflectionCardDropPreview />
          </Grid>
        )}
      />
    </RetroBackground>
  ));
